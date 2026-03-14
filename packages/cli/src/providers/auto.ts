import type { AgentType } from "../agents.js";
import { getPreferredAgent } from "../agents.js";
import { claudeCliProvider } from "./claude-cli.js";
import { codexExecProvider } from "./codex-exec.js";
import { cursorAcpProvider } from "./cursor-acp.js";
import { localProvider } from "./local.js";
import type { AIProvider, GenerateMessageContext } from "./types.js";

const INVOKERS: Record<AgentType, AIProvider> = {
  "claude-code": claudeCliProvider,
  codex: codexExecProvider,
  cursor: cursorAcpProvider,
};

export const autoProvider: AIProvider = {
  generateMessage(diff: string, context: GenerateMessageContext) {
    const raw = context.preferredAgent ?? getPreferredAgent();
    const agent = raw as AgentType | null;
    if (!agent || !(agent in INVOKERS)) {
      return localProvider.generateMessage(diff, context);
    }
    return INVOKERS[agent].generateMessage(diff, context);
  },
  name: "auto",
};
