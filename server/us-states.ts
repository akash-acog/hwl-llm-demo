// US State standardization utilities
// Converts state names, abbreviations, and common variations to standardized 2-letter codes

const STATE_CODES: Record<string, string> = {
  // Full names (lowercase)
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  // DC
  "district of columbia": "DC",
  "washington dc": "DC",
  "washington d.c.": "DC",
  // Territories
  "puerto rico": "PR",
  guam: "GU",
  "virgin islands": "VI",
  "american samoa": "AS",
  "northern mariana islands": "MP",
};

// Valid 2-letter codes (for validation)
const VALID_CODES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC", "PR", "GU", "VI", "AS", "MP",
]);

// State code to full name mapping
const CODE_TO_NAME: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
  PR: "Puerto Rico",
  GU: "Guam",
  VI: "Virgin Islands",
  AS: "American Samoa",
  MP: "Northern Mariana Islands",
};

/**
 * Normalize a state input to a 2-letter state code.
 * Returns null if the input cannot be normalized.
 *
 * @param input - State name, abbreviation, or variation
 * @returns 2-letter state code or null
 */
export function normalizeState(input: string | null | undefined): string | null {
  if (!input) return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  // Check if it's already a valid 2-letter code
  const upper = trimmed.toUpperCase();
  if (upper.length === 2 && VALID_CODES.has(upper)) {
    return upper;
  }

  // Try to match against known names
  const lower = trimmed.toLowerCase();
  const code = STATE_CODES[lower];
  if (code) return code;

  // Try extracting state from common patterns like "City, ST" or "City, State" or "City, ST 12345"
  // Pattern matches: ", ST" or ", ST 12345" or ", State Name" at the end
  const commaMatch = input.match(/,\s*([A-Za-z]{2})\s*(?:\d{5}(?:-\d{4})?)?\s*$/i);
  if (commaMatch) {
    const potential = commaMatch[1]!;
    return normalizeState(potential);
  }

  // Also try matching ", State Name" (full name before optional zip)
  const fullNameMatch = input.match(/,\s*([A-Za-z][A-Za-z\s]+?)\s*(?:\d{5}(?:-\d{4})?)?\s*$/);
  if (fullNameMatch) {
    const potential = fullNameMatch[1]!.trim();
    const code = STATE_CODES[potential.toLowerCase()];
    if (code) return code;
  }

  return null;
}

export function isValidStateCode(code: string | null | undefined): boolean {
  if (!code) return false;
  return VALID_CODES.has(code.toUpperCase());
}

export function getStateName(code: string | null | undefined): string | null {
  if (!code) return null;
  return CODE_TO_NAME[code.toUpperCase()] || null;
}

export function getAllStateCodes(): string[] {
  return Array.from(VALID_CODES);
}

/**
 * Extract state code from a location string (e.g., "Los Angeles, CA" or "New York, New York")
 */
export function extractStateFromLocation(location: string | null | undefined): string | null {
  if (!location) return null;
  return normalizeState(location);
}
