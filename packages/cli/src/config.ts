import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { z } from "zod";

const configSchema = z.object({
  allowUnsanitized: z.boolean().default(false),
  conventionalTypes: z
    .array(z.string())
    .default([
      "feat",
      "fix",
      "docs",
      "style",
      "refactor",
      "test",
      "chore",
      "perf",
      "ci",
      "build",
    ]),
  customPrompt: z.string().optional(),
  model: z.string().optional(),
  provider: z
    .enum(["auto", "openai", "anthropic", "cursor", "local"])
    .default("auto"),
});

export type BetterCommitConfig = z.infer<typeof configSchema>;

const CONFIG_FILENAME = ".better-commit.json";

export const findConfigPath = (cwd: string = process.cwd()): string | null => {
  const path = join(cwd, CONFIG_FILENAME);
  return existsSync(path) ? path : null;
};

export const loadConfig = async (
  cwd: string = process.cwd()
): Promise<BetterCommitConfig> => {
  const path = findConfigPath(cwd);
  if (!path) {
    return configSchema.parse({});
  }
  try {
    const raw = await readFile(path, "utf8");
    return configSchema.parse(JSON.parse(raw));
  } catch {
    return configSchema.parse({});
  }
};

export const DEFAULT_CONFIG: BetterCommitConfig = configSchema.parse({});
