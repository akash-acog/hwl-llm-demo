// Multipart form data utilities
import type { FileInput } from "@/server/types";

export async function parseMultipartFiles(
  request: Request
): Promise<{ files: FileInput[]; fields: Record<string, string> }> {
  const formData = await request.formData();
  const files: FileInput[] = [];
  const fields: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "object" && value !== null && "arrayBuffer" in value) {
      // Convert File to FileInput
      const file = value as File;
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      files.push({
        data: base64,
        mimeType: file.type || "application/octet-stream",
        filename: file.name,
      });
    } else {
      // Regular form field
      fields[key] = value as string;
    }
  }

  return { files, fields };
}

export async function parseSingleFile(request: Request): Promise<{ file: FileInput; fields: Record<string, string> }> {
  const { files, fields } = await parseMultipartFiles(request);

  if (files.length === 0) {
    throw new Error("No file provided");
  }

  if (files.length > 1) {
    throw new Error("Only one file allowed");
  }

  return { file: files[0], fields };
}
