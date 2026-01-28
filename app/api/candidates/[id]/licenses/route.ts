// POST /api/candidates/[id]/licenses - Add license
import { NextRequest } from "next/server";
import { success, error, notFound, serverError } from "../../../lib/response";
import { parseSingleFile } from "../../../lib/multipart";
import { processLicense } from "@/server/process";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: candidateId } = await params;
    const { file, fields } = await parseSingleFile(request);

    const skipFileUpload = fields.uploadToStorage === "false";

    const result = await processLicense(candidateId, file, { skipFileUpload });

    return success(result, 201);
  } catch (err: any) {
    console.error("Failed to process license:", err);
    if (err.message?.includes("not found")) {
      return notFound("Candidate");
    }
    if (err.message?.includes("No file")) {
      return error("No file provided", "VALIDATION_ERROR", 400);
    }
    return serverError(err.message || "Failed to process license");
  }
}
