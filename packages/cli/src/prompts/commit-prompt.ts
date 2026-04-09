import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { GenerateMessageContext } from "../ai/types.js";

const DEFAULT_PROMPT = `You generate conventional commit messages. Output ONLY the commit message, no explanation.
Format: type(scope): subject
Keep subject under 72 chars, imperative mood.`;

const PROMPT_PATH = (() => {
  const dir = dirname(fileURLToPath(import.meta.url));
  return join(dir, "..", "..", "config", "prompts", "commit.txt");
})();

const promptCache = new Map<string, string>();

const loadPromptFromFile = async (): Promise<string> => {
  if (!existsSync(PROMPT_PATH)) {
    promptCache.set("", DEFAULT_PROMPT);
    return DEFAULT_PROMPT;
  }
  try {
    const raw = await readFile(PROMPT_PATH, "utf8");
    const content = raw.trim();
    promptCache.set("", content);
    return content;
  } catch {
    promptCache.set("", DEFAULT_PROMPT);
    return DEFAULT_PROMPT;
  }
};

export const getCommitPrompt = (customPrompt?: string): string => {
  if (customPrompt?.trim()) {
    return customPrompt.trim();
  }
  const cached = promptCache.get("");
  if (cached !== undefined) {
    return cached;
  }
  if (existsSync(PROMPT_PATH)) {
    try {
      const content = readFileSync(PROMPT_PATH, "utf8").trim();
      promptCache.set("", content);
      return content;
    } catch {
      // fall through to default
    }
  }
  promptCache.set("", DEFAULT_PROMPT);
  return DEFAULT_PROMPT;
};

export const getCommitPromptAsync = async (
  customPrompt?: string
): Promise<string> => {
  if (customPrompt?.trim()) {
    return customPrompt.trim();
  }
  const cached = promptCache.get("");
  if (cached !== undefined) {
    return cached;
  }
  return await loadPromptFromFile();
};

export const buildCommitPrompt = (
  diff: string,
  context: GenerateMessageContext,
  customPrompt?: string
): string => {
  const base = getCommitPrompt(customPrompt);
  const inferFromDiff = !context.type && context.scope === undefined;
  const hintPart = inferFromDiff
    ? "Infer the appropriate type and scope from the diff. Generate a conventional commit message."
    : `Generate a commit message. Type/scope hint: ${context.scope ? `${context.type ?? "feat"}(${context.scope})` : (context.type ?? "feat")}`;
  return `${base}\n\nDiff:\n${diff}\n\n${hintPart}`;
};

export const buildUserPrompt = (
  diff: string,
  context: GenerateMessageContext
): string => {
  const inferFromDiff = !context.type && context.scope === undefined;
  return inferFromDiff
    ? `Diff:\n${diff}\n\nInfer the appropriate type and scope from the diff. Generate a conventional commit message.`
    : `Diff:\n${diff}\n\nGenerate a commit message. Type/scope hint: ${context.scope ? `${context.type ?? "feat"}(${context.scope})` : (context.type ?? "feat")}`;
};

export const getShortPromptHint = (): string =>
  "Generate a conventional commit message from the diff on stdin. Output ONLY the commit message, no explanation. Format: type(scope): subject. Keep subject under 72 chars.";
