import type { ZodType, infer as ZodInfer } from "zod";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { generateText, Output, type UserContent } from "ai";

export type TextContent = { type: "text"; text: string };
export type ImageContent = { type: "image"; image: string; mimeType?: string };
export type FileContent = { type: "file"; data: string; mimeType: string };
export type Content = TextContent | ImageContent | FileContent;

export type ModelOptions = {
  model?: string;
  modelFn?: (model: string) => any;
};

export type StructuredOutputOptions<T extends ZodType> = {
  input: Content[];
  system: string;
  prompt?: string;
  schema: T;
  model?: ModelOptions;
};

function extractMimeType(dataUrl: string): string | undefined {
  const match = dataUrl.match(/^data:([^;,]+)/);
  return match ? match[1] : undefined;
}

function isDataUrl(str: string): boolean {
  return str.startsWith("data:");
}

function buildPromptContent(input: Content[], prompt?: string): UserContent {
  const parts: UserContent = [];

  if (prompt) {
    parts.push({ type: "text", text: prompt });
  }

  for (const item of input) {
    switch (item.type) {
      case "text":
        parts.push({ type: "text", text: item.text });
        break;

      case "image": {
        const mediaType =
          item.mimeType ||
          (isDataUrl(item.image) ? extractMimeType(item.image) : undefined);
        if (mediaType) {
          parts.push({ type: "image", image: item.image, mediaType });
        } else {
          parts.push({ type: "image", image: item.image });
        }
        break;
      }

      case "file": {
        const mediaType =
          item.mimeType ||
          (isDataUrl(item.data) ? extractMimeType(item.data) : undefined) ||
          "application/octet-stream";
        parts.push({ type: "file", data: item.data, mediaType });
        break;
      }
    }
  }

  if (parts.length === 0) {
    parts.push({ type: "text", text: "Process the provided content." });
  }

  return parts;
}

export async function getStructuredOutput<T extends ZodType>(
  options: StructuredOutputOptions<T>,
): Promise<ZodInfer<T>> {
  const { input, system, prompt, schema, model: modelOptions = {} } = options;
  const { model = "gpt-4o-mini", modelFn = openai } = modelOptions;

  const content = buildPromptContent(input, prompt);

  const result = await generateText({
    model: modelFn(model),
    system,
    messages: [{ role: "user", content }],
    output: Output.object({ schema }),
  });

  return result.output as ZodInfer<T>;
}

export const providers = {
  openai: { fn: openai, defaultModel: "gpt-4o" },
  gemini: { fn: google, defaultModel: "gemini-2.0-flash" },
} as const;

export type ProviderName = keyof typeof providers;
