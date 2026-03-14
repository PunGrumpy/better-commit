import { getPreferredAgent } from "../agents.js";
import type { BetterCommitConfig } from "../config.js";
import { ProviderRegistry } from "./registry.js";
import type { AIProvider } from "./types.js";

export interface ProviderResolution {
  effectiveProvider: AIProvider;
  preferredAgent: string | null;
  providerName: string;
  useAi: boolean;
}

export const resolveProvider = async (
  config: BetterCommitConfig,
  options: { noAi?: boolean },
  selectUseAI?: () => Promise<boolean>
): Promise<ProviderResolution> => {
  const preferredAgent =
    config.provider === "auto" ? getPreferredAgent() : null;

  const useAi =
    !options.noAi &&
    config.provider !== "local" &&
    (config.provider !== "auto" ||
      !!preferredAgent ||
      (selectUseAI ? await selectUseAI() : false));

  const providerName =
    config.provider === "auto" ? (preferredAgent ?? "local") : config.provider;

  const provider = ProviderRegistry.findProvider(config.provider);
  const local = ProviderRegistry.findProvider("local");
  const effectiveProvider = provider ?? local;
  if (!effectiveProvider) {
    throw new Error("No AI provider available");
  }

  return {
    effectiveProvider,
    preferredAgent,
    providerName,
    useAi,
  };
};
