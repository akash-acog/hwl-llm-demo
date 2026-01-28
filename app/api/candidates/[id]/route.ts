// GET /api/candidates/[id] - Get candidate
// PATCH /api/candidates/[id] - Update candidate
// DELETE /api/candidates/[id] - Delete candidate
import { NextRequest } from "next/server";
import { success, error, notFound, serverError } from "../../lib/response";
import { getQueryArray, getQueryBoolean } from "../../lib/query";
import { candidates } from "@/server/db/queries";
import { deleteFiles } from "@/server/storage";
import type { SourceFile } from "@/server/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const include = getQueryArray(request, "include");

    let candidate;
    if (include.includes("licenses") || include.includes("certifications")) {
      candidate = await candidates.getWithRelations(id);
    } else {
      candidate = await candidates.get(id);
    }

    if (!candidate) {
      return notFound("Candidate");
    }

    return success(candidate);
  } catch (err: any) {
    console.error("Failed to get candidate:", err);
    if (err.message?.includes("not found")) {
      return notFound("Candidate");
    }
    return serverError(err.message || "Failed to get candidate");
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const updated = await candidates.update(id, updates);

    return success(updated);
  } catch (err: any) {
    console.error("Failed to update candidate:", err);
    if (err.message?.includes("not found")) {
      return notFound("Candidate");
    }
    return serverError(err.message || "Failed to update candidate");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleteStoredFiles = getQueryBoolean(request, "deleteFiles", false);

    // Get candidate first to get file paths
    const candidate = await candidates.get(id);
    if (!candidate) {
      return notFound("Candidate");
    }

    // Delete from database (cascades to licenses and certifications)
    await candidates.delete(id);

    // Optionally delete files from storage
    let filesDeleted = 0;
    if (deleteStoredFiles && candidate.source_files) {
      const sourceFiles = candidate.source_files as SourceFile[];
      const paths = sourceFiles.map((f) => f.storagePath);
      if (paths.length > 0) {
        await deleteFiles(paths);
        filesDeleted = paths.length;
      }
    }

    return success({
      deleted: true,
      candidateId: id,
      filesDeleted,
    });
  } catch (err: any) {
    console.error("Failed to delete candidate:", err);
    if (err.message?.includes("not found")) {
      return notFound("Candidate");
    }
    return serverError(err.message || "Failed to delete candidate");
  }
}
