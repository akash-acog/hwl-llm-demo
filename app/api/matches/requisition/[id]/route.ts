// GET /api/matches/requisition/[id] - Get candidate matches for requisition
import { NextRequest } from "next/server";
import { success, notFound, serverError } from "../../../lib/response";
import { getQueryParam, getQueryNumber, getPagination } from "../../../lib/query";
import { findCandidatesForRequisition } from "@/server/matching";
import type { DocumentStatus } from "@/server/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: requisitionId } = await params;

    const statusParam = getQueryParam(request, "status");
    const minScore = getQueryNumber(request, "minScore", 0);
    const { limit, offset } = getPagination(request);

    // Build filters
    const filters: any = {};
    if (statusParam) {
      filters.status = statusParam;
    }

    // Get matches
    const allMatches = await findCandidatesForRequisition(requisitionId, filters);

    // Filter by score
    const filteredMatches = allMatches.filter((m) => m.score.overall >= minScore!);

    const total = filteredMatches.length;
    const paginatedMatches = filteredMatches.slice(offset, offset! + limit!);

    return success({
      requisitionId,
      matches: paginatedMatches,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset! + limit! < total,
      },
    });
  } catch (err: any) {
    console.error("Failed to get requisition matches:", err);
    if (err.message?.includes("not found")) {
      return notFound("Requisition");
    }
    return serverError(err.message || "Failed to get requisition matches");
  }
}
