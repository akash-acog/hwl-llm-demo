import { z } from "zod";
import { getStructuredOutput, providers } from "./ai";
import {
  facilities,
  canonicalLicenses,
  canonicalCertifications,
  canonicalJobTitles,
} from "./db/queries";
import type { CanonicalKey, CanonicalResult, MatchType } from "./types";

// Configuration
const FUZZY_THRESHOLD = 0.9; // 90% similarity required for fuzzy match

// Entry types for canonical tables
type CanonicalEntry = {
  id: string;
  name: string;
  abbreviation?: string;
  aliases?: string[];
};

// Levenshtein distance calculation
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1, // substitution
          matrix[i]![j - 1]! + 1, // insertion
          matrix[i - 1]![j]! + 1, // deletion
        );
      }
    }
  }

  return matrix[b.length]![a.length]!;
}

// Calculate similarity score (0-1) between two strings
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  return 1 - distance / maxLen;
}

// Get all comparison strings for an entry
function getComparisonStrings(entry: CanonicalEntry): string[] {
  const strings: string[] = [entry.name];
  if (entry.abbreviation) strings.push(entry.abbreviation);
  if (entry.aliases) strings.push(...entry.aliases);
  return strings;
}

// Fetch canonical entries based on key type
async function getEntries(key: CanonicalKey): Promise<CanonicalEntry[]> {
  switch (key) {
    case "facilityName": {
      const list = await facilities.list();
      return list.map((f) => ({
        id: f.id,
        name: f.name,
        aliases: f.aliases,
      }));
    }
    case "licenseType": {
      const list = await canonicalLicenses.list();
      return list.map((l) => ({
        id: l.id,
        name: l.name,
        abbreviation: l.abbreviation,
        aliases: l.aliases,
      }));
    }
    case "certType": {
      const list = await canonicalCertifications.list();
      return list.map((c) => ({
        id: c.id,
        name: c.name,
        abbreviation: c.abbreviation,
        aliases: c.aliases,
      }));
    }
    case "jobTitle": {
      const list = await canonicalJobTitles.list();
      return list.map((j) => ({
        id: j.id,
        name: j.name,
        abbreviation: j.abbreviation,
        aliases: j.aliases,
      }));
    }
  }
}

// Step 1: Exact match (case-insensitive)
function exactMatch(
  rawValue: string,
  entries: CanonicalEntry[],
): { entry: CanonicalEntry; matchedOn: string } | null {
  const normalized = rawValue.toLowerCase().trim();

  for (const entry of entries) {
    // Check abbreviation first (most common match)
    if (entry.abbreviation?.toLowerCase() === normalized) {
      return { entry, matchedOn: `abbreviation '${entry.abbreviation}'` };
    }

    // Check name
    if (entry.name.toLowerCase() === normalized) {
      return { entry, matchedOn: `name '${entry.name}'` };
    }

    // Check aliases
    if (entry.aliases) {
      for (const alias of entry.aliases) {
        if (alias.toLowerCase() === normalized) {
          return { entry, matchedOn: `alias '${alias}'` };
        }
      }
    }
  }

  return null;
}

// Step 2: Fuzzy match using Levenshtein distance
function fuzzyMatch(
  rawValue: string,
  entries: CanonicalEntry[],
): { entry: CanonicalEntry; matchedOn: string; score: number } | null {
  const normalized = rawValue.toLowerCase().trim();
  let bestMatch: {
    entry: CanonicalEntry;
    matchedOn: string;
    score: number;
  } | null = null;

  for (const entry of entries) {
    const comparisonStrings = getComparisonStrings(entry);

    for (const compareStr of comparisonStrings) {
      const score = similarity(normalized, compareStr);

      if (score >= FUZZY_THRESHOLD && (!bestMatch || score > bestMatch.score)) {
        const matchType =
          compareStr === entry.name
            ? "name"
            : compareStr === entry.abbreviation
              ? "abbreviation"
              : "alias";
        bestMatch = {
          entry,
          matchedOn: `${matchType} '${compareStr}' (${Math.round(score * 100)}% match)`,
          score,
        };
      }
    }
  }

  return bestMatch;
}

// Step 3: AI-based semantic matching
const aiMatchSchema = z.object({
  matchId: z.string().nullable(),
  confidence: z.number(),
  reasoning: z.string(),
});

async function aiMatch(
  rawValue: string,
  key: CanonicalKey,
  entries: CanonicalEntry[],
): Promise<{
  entry: CanonicalEntry | null;
  confidence: number;
  reason: string;
}> {
  if (entries.length === 0) {
    return {
      entry: null,
      confidence: 0,
      reason: "No canonical entries available",
    };
  }

  const entriesText = entries
    .map((e) => {
      let text = `id: "${e.id}", name: "${e.name}"`;
      if (e.abbreviation) text += `, abbreviation: "${e.abbreviation}"`;
      if (e.aliases?.length) text += `, aliases: ${JSON.stringify(e.aliases)}`;
      return text;
    })
    .join("\n");

  const keyDescription = {
    facilityName: "healthcare facility or hospital",
    licenseType: "professional medical/nursing license",
    certType: "healthcare certification",
    jobTitle: "healthcare job title or position",
  }[key];

  const system = `You are a semantic matching assistant for healthcare workforce data.

Your task:
- Select exactly one canonical entry ID from the provided list, OR return null.
- NEVER invent an ID.
- Only select an ID if there is a clear semantic match.
- If unsure, return null.
- Give a reason that is a short to the point one-liner that explains why you made that choice.

Confidence rules:
- Confidence is ignored unless a valid ID is selected.
- Do NOT return confidence > 0.5 unless you are reasonably certain.`;

  const prompt = `Input value:
"${rawValue}"

Canonical entries:
${entriesText}

Return the best matching canonical entry ID, or null if none apply.`;

  try {
    const result = await getStructuredOutput({
      input: [{ type: "text", text: prompt }],
      system,
      schema: aiMatchSchema,
      model: {
        model: providers.openai.defaultModel,
        modelFn: providers.openai.fn,
      },
    });

    // AI abstained or low confidence → hard fail
    if (!result.matchId || result.confidence < 0.5) {
      return {
        entry: null,
        confidence: 0,
        reason: "AI did not identify a confident canonical match",
      };
    }

    // Validate ID exists for this key
    const matchedEntry = entries.find((e) => e.id === result.matchId);

    if (!matchedEntry) {
      return {
        entry: null,
        confidence: 0,
        reason: `AI returned unknown canonical id '${result.matchId}'`,
      };
    }

    // Successful, valid AI-assisted match
    return {
      entry: matchedEntry,
      confidence: Math.min(result.confidence, 0.7), // optional but recommended cap
      reason: `AI semantic match: ${result.reasoning}`,
    };
  } catch (error) {
    return {
      entry: null,
      confidence: 0,
      reason: `AI matching failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Main canonicalization function with waterfall logic
export async function canonicalize(
  key: CanonicalKey,
  rawValue: string,
): Promise<CanonicalResult> {
  if (!rawValue || rawValue.trim() === "") {
    return {
      key,
      rawValue,
      canonicalId: null,
      canonicalValue: null,
      matchType: "none",
      confidence: 0,
      reason: "Empty input value",
    };
  }

  const entries = await getEntries(key);

  if (entries.length === 0) {
    return {
      key,
      rawValue,
      canonicalId: null,
      canonicalValue: null,
      matchType: "none",
      confidence: 0,
      reason: "No canonical entries found in database",
    };
  }

  // Step 1: Try exact match
  const exact = exactMatch(rawValue, entries);
  if (exact) {
    return {
      key,
      rawValue,
      canonicalId: exact.entry.id,
      canonicalValue: exact.entry.name,
      matchType: "exact",
      confidence: 1.0,
      reason: `Exact match on ${exact.matchedOn}`,
    };
  }

  // Step 2: Try fuzzy match
  const fuzzy = fuzzyMatch(rawValue, entries);
  if (fuzzy) {
    return {
      key,
      rawValue,
      canonicalId: fuzzy.entry.id,
      canonicalValue: fuzzy.entry.name,
      matchType: "fuzzy",
      confidence: fuzzy.score,
      reason: `Fuzzy match on ${fuzzy.matchedOn}`,
    };
  }

  // Step 3: Try AI match
  const ai = await aiMatch(rawValue, key, entries);
  if (ai.entry) {
    return {
      key,
      rawValue,
      canonicalId: ai.entry.id,
      canonicalValue: ai.entry.name,
      matchType: "ai",
      confidence: ai.confidence,
      reason: ai.reason,
    };
  }

  // No match found
  return {
    key,
    rawValue,
    canonicalId: null,
    canonicalValue: null,
    matchType: "none",
    confidence: 0,
    reason: ai.reason || "No matching canonical entry found",
  };
}

// Batch canonicalization for multiple values
export async function canonicalizeBatch(
  items: Array<{ key: CanonicalKey; rawValue: string }>,
): Promise<CanonicalResult[]> {
  return Promise.all(
    items.map((item) => canonicalize(item.key, item.rawValue)),
  );
}

// Export types and utilities
export type { CanonicalEntry };
export { similarity, levenshteinDistance, FUZZY_THRESHOLD };
