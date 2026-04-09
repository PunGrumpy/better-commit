import {
  createAnthropicProvider,
  createOpenAIProvider,
} from "./cloud-providers.js";
import { autoProvider, localProvider } from "./local-auto.js";
import { ProviderRegistry } from "./registry.js";
import {
  claudeCliProvider,
  codexExecProvider,
  cursorAcpProvider,
} from "./subprocess-agents.js";

ProviderRegistry.register(localProvider);
ProviderRegistry.register(autoProvider);
ProviderRegistry.register(cursorAcpProvider);
ProviderRegistry.register(claudeCliProvider);
ProviderRegistry.register(codexExecProvider);

const openai = createOpenAIProvider();
if (openai) {
  ProviderRegistry.register(openai);
}

const anthropic = createAnthropicProvider();
if (anthropic) {
  ProviderRegistry.register(anthropic);
}

export { ProviderRegistry, resolveProvider } from "./registry.js";
export type { ProviderResolution } from "./registry.js";
export type { AIProvider, GenerateMessageContext } from "./types.js";
