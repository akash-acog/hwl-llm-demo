// GET /api/matches/candidate/[id] - Get requisition matches for candidate
import { NextRequest } from "next/server";
import { success, notFound, serverError } from "../../../lib/response";
import { getQueryParam, getQueryNumber, getQueryBoolean, getPagination } from "../../../lib/query";
import { findRequisitionsForCandidate } from "@/server/matching";
import type { DocumentStatus } from "@/server/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: candidateId } = await params;

    const statusParam = getQueryParam(request, "status");
    const includeExpired = getQueryBoolean(request, "includeExpired", false);
    const minScore = getQueryNumber(request, "minScore", 0);
    const { limit, offset } = getPagination(request);

    // Build filters
    const filters: any = {};
    if (statusParam) {
      filters.status = statusParam;
    }
    if (!includeExpired) {
      filters.notExpired = true;
    }

    // Get matches
    const allMatches = await findRequisitionsForCandidate(candidateId, filters);

    // Filter by score
    const filteredMatches = allMatches.filter((m) => m.score.overall >= minScore!);

    const total = filteredMatches.length;
    const paginatedMatches = filteredMatches.slice(offset, offset! + limit!);

    return success({
      candidateId,
      matches: paginatedMatches,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset! + limit! < total,
      },
    });
  } catch (err: any) {
    console.error("Failed to get candidate matches:", err);
    if (err.message?.includes("not found")) {
      return notFound("Candidate");
    }
    return serverError(err.message || "Failed to get candidate matches");
  }
}
