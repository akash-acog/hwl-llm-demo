// GET /api/facilities/[id] - Get facility
// PATCH /api/facilities/[id] - Update facility
import { NextRequest } from "next/server";
import { success, notFound, serverError } from "../../lib/response";
import { facilities } from "@/server/db/queries";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const facility = await facilities.get(id);

    if (!facility) {
      return notFound("Facility");
    }

    return success(facility);
  } catch (err: any) {
    console.error("Failed to get facility:", err);
    if (err.message?.includes("not found")) {
      return notFound("Facility");
    }
    return serverError(err.message || "Failed to get facility");
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const updated = await facilities.update(id, updates);

    return success(updated);
  } catch (err: any) {
    console.error("Failed to update facility:", err);
    if (err.message?.includes("not found")) {
      return notFound("Facility");
    }
    return serverError(err.message || "Failed to update facility");
  }
}
