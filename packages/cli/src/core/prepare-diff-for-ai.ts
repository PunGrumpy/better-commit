import type { ResolvedCommitConfig } from "../config/types.js";
import { sanitizeDiff, truncateDiff } from "./sanitize.js";

const CLOUD_PROVIDERS = new Set(["openai", "anthropic"]);

export const prepareDiffForAi = (
  diff: string,
  config: ResolvedCommitConfig
): string => {
  const truncated = truncateDiff(diff);
  const provider = config.ai?.provider ?? "local";
  const allowUnsanitized = config.ai?.allowUnsanitized ?? false;

  if (!CLOUD_PROVIDERS.has(provider) && allowUnsanitized) {
    return truncated;
  }
  return sanitizeDiff(truncated);
};
