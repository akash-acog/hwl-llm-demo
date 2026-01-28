// GET /api/requisitions/[id] - Get requisition
// PATCH /api/requisitions/[id] - Update requisition
// DELETE /api/requisitions/[id] - Delete requisition
import { NextRequest } from "next/server";
import { success, notFound, serverError } from "../../lib/response";
import { getQueryArray, getQueryBoolean } from "../../lib/query";
import { requisitions } from "@/server/db/queries";
import { deleteFiles } from "@/server/storage";
import type { SourceFile } from "@/server/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const include = getQueryArray(request, "include");

    let requisition;
    if (include.includes("licenses") || include.includes("certifications") || include.includes("facility")) {
      requisition = await requisitions.getWithRelations(id);
    } else {
      requisition = await requisitions.get(id);
    }

    if (!requisition) {
      return notFound("Requisition");
    }

    return success(requisition);
  } catch (err: any) {
    console.error("Failed to get requisition:", err);
    if (err.message?.includes("not found")) {
      return notFound("Requisition");
    }
    return serverError(err.message || "Failed to get requisition");
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const updated = await requisitions.update(id, updates);

    return success(updated);
  } catch (err: any) {
    console.error("Failed to update requisition:", err);
    if (err.message?.includes("not found")) {
      return notFound("Requisition");
    }
    return serverError(err.message || "Failed to update requisition");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleteStoredFiles = getQueryBoolean(request, "deleteFiles", false);

    // Get requisition first to get file paths
    const requisition = await requisitions.get(id);
    if (!requisition) {
      return notFound("Requisition");
    }

    // Delete from database (cascades to licenses and certifications)
    await requisitions.delete(id);

    // Optionally delete files from storage
    let filesDeleted = 0;
    if (deleteStoredFiles && requisition.source_files) {
      const sourceFiles = requisition.source_files as SourceFile[];
      const paths = sourceFiles.map((f) => f.storagePath);
      if (paths.length > 0) {
        await deleteFiles(paths);
        filesDeleted = paths.length;
      }
    }

    return success({
      deleted: true,
      requisitionId: id,
      filesDeleted,
    });
  } catch (err: any) {
    console.error("Failed to delete requisition:", err);
    if (err.message?.includes("not found")) {
      return notFound("Requisition");
    }
    return serverError(err.message || "Failed to delete requisition");
  }
}
