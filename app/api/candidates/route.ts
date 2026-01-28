// POST /api/candidates - Process resume(s)
// GET /api/candidates - List candidates
import { NextRequest } from "next/server";
import { success, error, serverError } from "../lib/response";
import { parseMultipartFiles } from "../lib/multipart";
import { getQueryParam, getQueryArray, getPagination } from "../lib/query";
import { processResume } from "@/server/process";
import { candidates } from "@/server/db/queries";
import type { DocumentStatus } from "@/server/types";

export async function POST(request: NextRequest) {
  try {
    const { files, fields } = await parseMultipartFiles(request);

    if (files.length === 0) {
      return error("No files provided", "VALIDATION_ERROR", 400);
    }

    const skipFileUpload = fields.uploadToStorage === "false";

    // Process each resume
    const results = await Promise.all(
      files.map((file) =>
        processResume([file], {
          skipFileUpload,
        })
      )
    );

    // Calculate aggregate stats
    const totalParsingStats = results.reduce(
      (acc, r) => ({
        explicit: acc.explicit + r.parsingStats.explicit,
        implicit: acc.implicit + r.parsingStats.implicit,
        ambiguous: acc.ambiguous + r.parsingStats.ambiguous,
        missing: acc.missing + r.parsingStats.missing,
      }),
      { explicit: 0, implicit: 0, ambiguous: 0, missing: 0 }
    );

    const totalCanonStats = results.reduce(
      (acc, r) => ({
        resolved: acc.resolved + r.canonStats.resolved,
        unresolved: acc.unresolved + r.canonStats.unresolved,
        total: acc.total + r.canonStats.total,
      }),
      { resolved: 0, unresolved: 0, total: 0 }
    );

    return success(
      {
        processed: results.length,
        results,
        totalParsingStats,
        totalCanonStats,
      },
      201
    );
  } catch (err: any) {
    console.error("Failed to process resumes:", err);
    return serverError(err.message || "Failed to process resumes");
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = getQueryParam(request, "status") as DocumentStatus | "all" | null;
    const state = getQueryParam(request, "state");
    const jobTitleId = getQueryParam(request, "jobTitleId");
    const search = getQueryParam(request, "search");
    const include = getQueryArray(request, "include");
    const { limit, offset } = getPagination(request);

    // Build filters
    const filters: any = {};
    if (status && status !== "all") {
      filters.status = status;
    }

    // Get candidates
    let candidateList = await candidates.list(filters);

    // Apply additional filters
    if (state) {
      candidateList = candidateList.filter((c) => c.state === state);
    }
    if (jobTitleId) {
      candidateList = candidateList.filter((c) => c.canonical_job_title_id === jobTitleId);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      candidateList = candidateList.filter(
        (c) =>
          c.first_name.toLowerCase().includes(searchLower) ||
          c.last_name.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower)
      );
    }

    const total = candidateList.length;
    const paginatedList = candidateList.slice(offset, offset! + limit!);

    // Optionally fetch relations
    let enrichedList = paginatedList;
    if (include.length > 0) {
      enrichedList = await Promise.all(
        paginatedList.map(async (c) => {
          if (include.includes("licenses") || include.includes("certifications")) {
            return candidates.getWithRelations(c.id);
          }
          return c;
        })
      );
    }

    return success({
      data: enrichedList,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset! + limit! < total,
      },
    });
  } catch (err: any) {
    console.error("Failed to list candidates:", err);
    return serverError(err.message || "Failed to list candidates");
  }
}
