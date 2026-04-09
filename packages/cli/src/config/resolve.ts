import { z } from "zod";

import {
  DuplicatePluginError,
  MissingConventionalPluginError,
} from "./errors.js";
import type { ResolvedCommitConfig, UserConfig } from "./types.js";

const providerNameSchema = z.enum([
  "auto",
  "local",
  "openai",
  "anthropic",
  "cursor",
  "claude-cli",
  "codex-exec",
]);

const resolvedSchema = z.object({
  ai: z
    .object({
      allowUnsanitized: z.boolean(),
      customPrompt: z.string().optional(),
      model: z.string().optional(),
      provider: providerNameSchema,
    })
    .optional(),
  pluginIds: z.array(z.string()),
  rules: z.object({
    scopes: z.array(z.string()).optional(),
    strictScopes: z.boolean(),
    types: z.array(z.string()).min(1),
  }),
});

const CONVENTIONAL_ID = "conventional-commits";

export function mergeUserConfig(config: UserConfig): ResolvedCommitConfig {
  const { plugins } = config;
  const seen = new Set<string>();
  for (const plugin of plugins) {
    if (seen.has(plugin.id)) {
      throw new DuplicatePluginError(plugin.id);
    }
    seen.add(plugin.id);
  }

  const hasConventional = plugins.some((p) => p.id === CONVENTIONAL_ID);
  if (!hasConventional) {
    throw new MissingConventionalPluginError();
  }

  const pluginIds = plugins.map((p) => p.id);

  const rules: ResolvedCommitConfig["rules"] = {
    scopes: undefined,
    strictScopes: false,
    types: [],
  };

  for (const plugin of plugins) {
    if (!plugin.rules) {
      continue;
    }
    const r = plugin.rules;
    if (r.types !== undefined && r.types.length > 0) {
      rules.types = [...r.types];
    }
    if (r.scopes !== undefined) {
      rules.scopes = r.scopes.length > 0 ? [...r.scopes] : undefined;
    }
    if (r.strictScopes !== undefined) {
      rules.strictScopes = r.strictScopes;
    }
  }

  if (rules.types.length === 0) {
    throw new Error(
      "conventionalCommits() must specify a non-empty types array."
    );
  }

  let ai: ResolvedCommitConfig["ai"];
  for (const plugin of plugins) {
    if (plugin.id === "ai-suggest" && plugin.ai) {
      ai = {
        allowUnsanitized: plugin.ai.allowUnsanitized ?? false,
        customPrompt: plugin.ai.customPrompt,
        model: plugin.ai.model,
        provider: plugin.ai.provider,
      };
      break;
    }
  }

  const merged: ResolvedCommitConfig = {
    ai,
    pluginIds,
    rules,
  };

  return resolvedSchema.parse(merged) as ResolvedCommitConfig;
}
