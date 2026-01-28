// PATCH /api/certifications/[id] - Update certification
// DELETE /api/certifications/[id] - Delete certification
import { NextRequest } from "next/server";
import { success, notFound, serverError } from "../../lib/response";
import { getQueryBoolean } from "../../lib/query";
import { candidates } from "@/server/db/queries";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const updated = await candidates.updateCertification(id, updates);

    return success(updated);
  } catch (err: any) {
    console.error("Failed to update certification:", err);
    if (err.message?.includes("not found")) {
      return notFound("Certification");
    }
    return serverError(err.message || "Failed to update certification");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await candidates.deleteCertification(id);

    return success({
      deleted: true,
      certificationId: id,
      fileDeleted: false, // TODO: Implement file deletion when we have getCertification
    });
  } catch (err: any) {
    console.error("Failed to delete certification:", err);
    if (err.message?.includes("not found")) {
      return notFound("Certification");
    }
    return serverError(err.message || "Failed to delete certification");
  }
}
