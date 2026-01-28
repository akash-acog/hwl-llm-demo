import { readdir } from "fs/promises";
import { join } from "path";
import type { ZodType } from "zod";
import { toolRegistry } from "./tools/index";

const TOOLS_DIR = join(process.cwd(), "server", "tools");

export type ToolManifest = {
  id: string;
  hasJsonLogic: boolean;
};

export type ToolDetails = {
  id: string;
  systemPrompt: string;
  prompt: string;
  schemaSource: string;
  jsonLogic: string | null;
};

export type LoadedTool = {
  id: string;
  systemPrompt: string;
  prompt: string;
  schema: ZodType;
};

async function fileExists(path: string): Promise<boolean> {
  try {
    await Bun.file(path).text();
    return true;
  } catch {
    return false;
  }
}

async function readFileOrNull(path: string): Promise<string | null> {
  try {
    return await Bun.file(path).text();
  } catch {
    return null;
  }
}

export async function listTools(): Promise<ToolManifest[]> {
  try {
    const entries = await readdir(TOOLS_DIR, { withFileTypes: true });
    const tools: ToolManifest[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const toolPath = join(TOOLS_DIR, entry.name);
      const hasSystem = await fileExists(join(toolPath, "system-prompt.md"));
      const hasPrompt = await fileExists(join(toolPath, "prompt.txt"));
      const hasSchema = await fileExists(join(toolPath, "schema.ts"));

      if (hasSystem && hasPrompt && hasSchema) {
        const hasJsonLogic = await fileExists(join(toolPath, "json-logic.ts"));
        tools.push({ id: entry.name, hasJsonLogic });
      }
    }

    return tools;
  } catch {
    return [];
  }
}

export async function getToolDetails(id: string): Promise<ToolDetails | null> {
  const toolPath = join(TOOLS_DIR, id);

  const systemPrompt = await readFileOrNull(join(toolPath, "system-prompt.md"));
  const prompt = await readFileOrNull(join(toolPath, "prompt.txt"));
  const schemaSource = await readFileOrNull(join(toolPath, "schema.ts"));

  if (!systemPrompt || !prompt || !schemaSource) {
    return null;
  }

  const jsonLogic = await readFileOrNull(join(toolPath, "json-logic.ts"));

  return { id, systemPrompt, prompt, schemaSource, jsonLogic };
}

export async function loadTool(id: string): Promise<LoadedTool | null> {
  const toolPath = join(TOOLS_DIR, id);

  const systemPrompt = await readFileOrNull(join(toolPath, "system-prompt.md"));
  const prompt = await readFileOrNull(join(toolPath, "prompt.txt"));

  if (!systemPrompt || !prompt) {
    return null;
  }

  const toolConfig = toolRegistry[id];
  if (!toolConfig) {
    return null;
  }

  return { id, systemPrompt, prompt, schema: toolConfig.schema };
}
