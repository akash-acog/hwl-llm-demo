// PATCH /api/licenses/[id] - Update license
// DELETE /api/licenses/[id] - Delete license
import { NextRequest } from "next/server";
import { success, notFound, serverError } from "../../lib/response";
import { getQueryBoolean } from "../../lib/query";
import { candidates } from "@/server/db/queries";
import { deleteFile } from "@/server/storage";
import type { SourceFile } from "@/server/types";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const updated = await candidates.updateLicense(id, updates);

    return success(updated);
  } catch (err: any) {
    console.error("Failed to update license:", err);
    if (err.message?.includes("not found")) {
      return notFound("License");
    }
    return serverError(err.message || "Failed to update license");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleteStoredFile = getQueryBoolean(request, "deleteFile", false);

    // Get license first to get file path
    const licenses = await candidates.list(); // TODO: Need a getLicense method
    // For now, we'll just delete without file cleanup
    // This should be enhanced with a proper getLicense method

    await candidates.deleteLicense(id);

    return success({
      deleted: true,
      licenseId: id,
      fileDeleted: false, // TODO: Implement file deletion when we have getLicense
    });
  } catch (err: any) {
    console.error("Failed to delete license:", err);
    if (err.message?.includes("not found")) {
      return notFound("License");
    }
    return serverError(err.message || "Failed to delete license");
  }
}
