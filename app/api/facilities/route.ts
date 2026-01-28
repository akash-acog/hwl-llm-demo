// GET /api/facilities - List facilities
// POST /api/facilities - Create facility
import { NextRequest } from "next/server";
import { success, error, serverError } from "../lib/response";
import { getQueryParam, getPagination } from "../lib/query";
import { facilities } from "@/server/db/queries";

export async function GET(request: NextRequest) {
  try {
    const state = getQueryParam(request, "state");
    const search = getQueryParam(request, "search");
    const { limit, offset } = getPagination(request);

    // Get all facilities
    let facilityList = await facilities.list();

    // Apply filters
    if (state) {
      facilityList = facilityList.filter((f) => f.state === state);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      facilityList = facilityList.filter(
        (f) =>
          f.name.toLowerCase().includes(searchLower) ||
          f.aliases?.some((alias) => alias.toLowerCase().includes(searchLower))
      );
    }

    const total = facilityList.length;
    const paginatedList = facilityList.slice(offset, offset! + limit!);

    return success({
      data: paginatedList,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset! + limit! < total,
      },
    });
  } catch (err: any) {
    console.error("Failed to list facilities:", err);
    return serverError(err.message || "Failed to list facilities");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return error("Facility name is required", "VALIDATION_ERROR", 400);
    }

    const facility = await facilities.create(body);

    return success(facility, 201);
  } catch (err: any) {
    console.error("Failed to create facility:", err);
    return serverError(err.message || "Failed to create facility");
  }
}
