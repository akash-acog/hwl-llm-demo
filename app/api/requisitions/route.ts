// POST /api/requisitions - Process requisition(s)
// GET /api/requisitions - List requisitions
import { NextRequest } from "next/server";
import { success, error, serverError } from "../lib/response";
import { parseMultipartFiles } from "../lib/multipart";
import { getQueryParam, getQueryArray, getQueryBoolean, getPagination } from "../lib/query";
import { processRequisition } from "@/server/process";
import { requisitions } from "@/server/db/queries";
import type { DocumentStatus } from "@/server/types";

export async function POST(request: NextRequest) {
  try {
    const { files, fields } = await parseMultipartFiles(request);

    if (files.length === 0) {
      return error("No files provided", "VALIDATION_ERROR", 400);
    }

    const facilityId = fields.facilityId || undefined;
    const skipFileUpload = fields.uploadToStorage === "false";

    // Process each file (note: one file can contain multiple requisitions)
    const results = await Promise.all(
      files.map((file) =>
        processRequisition([file], facilityId, {
          skipFileUpload,
        })
      )
    );

    // Flatten results and calculate aggregate stats
    const allResults = results.flatMap((r) => r.results);

    const totalParsingStats = results.reduce(
      (acc, r) => ({
        explicit: acc.explicit + r.totalParsingStats.explicit,
        implicit: acc.implicit + r.totalParsingStats.implicit,
        ambiguous: acc.ambiguous + r.totalParsingStats.ambiguous,
        missing: acc.missing + r.totalParsingStats.missing,
      }),
      { explicit: 0, implicit: 0, ambiguous: 0, missing: 0 }
    );

    const totalCanonStats = results.reduce(
      (acc, r) => ({
        resolved: acc.resolved + r.totalCanonStats.resolved,
        unresolved: acc.unresolved + r.totalCanonStats.unresolved,
        total: acc.total + r.totalCanonStats.total,
      }),
      { resolved: 0, unresolved: 0, total: 0 }
    );

    return success(
      {
        processed: files.length,
        totalRequisitions: allResults.length,
        results: allResults,
        totalParsingStats,
        totalCanonStats,
      },
      201
    );
  } catch (err: any) {
    console.error("Failed to process requisitions:", err);
    return serverError(err.message || "Failed to process requisitions");
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = getQueryParam(request, "status") as DocumentStatus | "all" | null;
    const facilityId = getQueryParam(request, "facilityId");
    const state = getQueryParam(request, "state");
    const notExpired = getQueryBoolean(request, "notExpired", false);
    const jobTitleId = getQueryParam(request, "jobTitleId");
    const search = getQueryParam(request, "search");
    const include = getQueryArray(request, "include");
    const { limit, offset } = getPagination(request);

    // Build filters
    const filters: any = {};
    if (status && status !== "all") {
      filters.status = status;
    }
    if (facilityId) {
      filters.facilityId = facilityId;
    }
    if (notExpired) {
      filters.notExpired = true;
    }

    // Get requisitions
    let requisitionList = await requisitions.list(filters);

    // Apply additional filters
    if (state) {
      requisitionList = requisitionList.filter((r) => r.state === state);
    }
    if (jobTitleId) {
      requisitionList = requisitionList.filter((r) => r.canonical_job_title_id === jobTitleId);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      requisitionList = requisitionList.filter(
        (r) =>
          r.job_title.toLowerCase().includes(searchLower) ||
          r.raw_facility_name?.toLowerCase().includes(searchLower) ||
          r.location?.toLowerCase().includes(searchLower)
      );
    }

    const total = requisitionList.length;
    const paginatedList = requisitionList.slice(offset, offset! + limit!);

    // Optionally fetch relations
    let enrichedList = paginatedList;
    if (include.length > 0) {
      enrichedList = await Promise.all(
        paginatedList.map(async (r) => {
          if (include.includes("licenses") || include.includes("certifications") || include.includes("facility")) {
            return requisitions.getWithRelations(r.id);
          }
          return r;
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
    console.error("Failed to list requisitions:", err);
    return serverError(err.message || "Failed to list requisitions");
  }
}
