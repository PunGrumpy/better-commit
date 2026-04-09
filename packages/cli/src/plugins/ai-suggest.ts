import type { BetterCommitPlugin, ProviderName } from "../config/types.js";

export function aiSuggest(options: {
  allowUnsanitized?: boolean;
  customPrompt?: string;
  model?: string;
  provider?: ProviderName;
}): BetterCommitPlugin {
  return {
    ai: {
      allowUnsanitized: options.allowUnsanitized ?? false,
      customPrompt: options.customPrompt,
      model: options.model,
      provider: options.provider ?? "auto",
    },
    apiVersion: 1,
    id: "ai-suggest",
  };
}
