import { getPreferredAgent } from "../agents.js";
import type { ResolvedCommitConfig } from "../config/types.js";
import type { AIProvider } from "./types.js";

const providers = new Map<string, AIProvider>();

export const ProviderRegistry = {
  findProvider(name: string): AIProvider | undefined {
    return providers.get(name.toLowerCase());
  },

  getProviders(): AIProvider[] {
    return [...providers.values()];
  },

  register(provider: AIProvider): void {
    providers.set(provider.name.toLowerCase(), provider);
  },
};

export interface ProviderResolution {
  effectiveProvider: AIProvider;
  preferredAgent: string | null;
  providerName: string;
  useAi: boolean;
}

export const resolveProvider = async (
  resolved: ResolvedCommitConfig,
  options: { noAi?: boolean },
  selectUseAI?: () => Promise<boolean>
): Promise<ProviderResolution> => {
  const local = ProviderRegistry.findProvider("local");
  if (!local) {
    throw new Error("No local provider available");
  }

  const aiDisabled = options.noAi || process.env.BETTER_COMMIT_NO_AI === "1";

  if (aiDisabled || resolved.ai === undefined) {
    return {
      effectiveProvider: local,
      preferredAgent: null,
      providerName: "local",
      useAi: false,
    };
  }

  const config = resolved.ai;
  const preferredAgent =
    config.provider === "auto" ? getPreferredAgent() : null;

  const useAi =
    config.provider !== "local" &&
    (config.provider !== "auto" ||
      !!preferredAgent ||
      (selectUseAI ? await selectUseAI() : false));

  const providerName =
    config.provider === "auto" ? (preferredAgent ?? "local") : config.provider;

  const provider = ProviderRegistry.findProvider(config.provider);
  const effectiveProvider = provider ?? local;

  return {
    effectiveProvider,
    preferredAgent,
    providerName,
    useAi,
  };
};
