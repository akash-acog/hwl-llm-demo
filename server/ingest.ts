import mammoth from "mammoth";
import type { Content } from "./ai";

const TEXT_TYPES = [
  "text/plain",
  "text/markdown",
  "text/rtf",
  "application/rtf",
];

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const PDF_TYPE = "application/pdf";
const DOCX_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type IngestInput = {
  data: string;
  mimeType: string;
};

async function extractDocxText(base64Data: string): Promise<string> {
  const buffer = Buffer.from(base64Data, "base64");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function ingest(inputs: IngestInput[]): Promise<Content[]> {
  const results: Content[] = [];

  for (const input of inputs) {
    const { data, mimeType } = input;

    if (mimeType === DOCX_TYPE) {
      const text = await extractDocxText(data);
      results.push({ type: "text", text });
    } else if (TEXT_TYPES.includes(mimeType)) {
      const text = Buffer.from(data, "base64").toString("utf-8");
      results.push({ type: "text", text });
    } else if (IMAGE_TYPES.includes(mimeType)) {
      results.push({ type: "image", image: data, mimeType });
    } else if (mimeType === PDF_TYPE) {
      results.push({ type: "file", data, mimeType });
    }
  }

  return results;
}
