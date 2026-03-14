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
