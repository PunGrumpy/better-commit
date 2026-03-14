import { createAnthropicProvider } from "./anthropic.js";
import { autoProvider } from "./auto.js";
import { claudeCliProvider } from "./claude-cli.js";
import { codexExecProvider } from "./codex-exec.js";
import { cursorAcpProvider } from "./cursor-acp.js";
import { localProvider } from "./local.js";
import { createOpenAIProvider } from "./openai.js";
import { ProviderRegistry } from "./registry.js";

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

export { ProviderRegistry } from "./registry.js";
export type { AIProvider, GenerateMessageContext } from "./types.js";
