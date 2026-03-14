import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const home = homedir();
const claudeHome =
  process.env.CLAUDE_CONFIG_DIR?.trim() || join(home, ".claude");
const codexHome = process.env.CODEX_HOME?.trim() || join(home, ".codex");

export type AgentType = "cursor" | "claude-code" | "codex";

const AGENT_ORDER: AgentType[] = ["cursor", "claude-code", "codex"];

const AGENTS: Record<AgentType, { detect: () => boolean }> = {
  "claude-code": { detect: () => existsSync(claudeHome) },
  codex: {
    detect: () => existsSync(codexHome) || existsSync("/etc/codex"),
  },
  cursor: { detect: () => existsSync(join(home, ".cursor")) },
};

export const detectInstalledAgents = (): AgentType[] =>
  AGENT_ORDER.filter((type) => AGENTS[type].detect());

export const getPreferredAgent = (): AgentType | null => {
  for (const type of AGENT_ORDER) {
    if (AGENTS[type].detect()) {
      return type;
    }
  }
  return null;
};
