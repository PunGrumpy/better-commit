import * as p from "@clack/prompts";

import { detectInstalledAgents, getPreferredAgent } from "../agents.js";
import {
  ConfigLoadError,
  findCommitConfigPath,
  loadResolvedConfigFromPath,
} from "../config/load.js";
import { exitFailure, exitSuccess } from "../core/exit.js";
import { hasStagedFiles, isGitRepo } from "../core/git.js";
import { ProviderRegistry } from "../ai/index.js";

type CheckStatus = "fail" | "pass";

interface CheckRow {
  detail?: string;
  name: string;
  status: CheckStatus;
}

function addConfigChecks(checks: CheckRow[], cwd: string): void {
  const configPath = findCommitConfigPath(cwd);
  if (!configPath) {
    checks.push({
      detail: "Add commit.config.ts or run `bc init`",
      name: "commit.config.ts",
      status: "fail",
    });
    return;
  }

  checks.push({
    detail: configPath,
    name: "commit.config.ts",
    status: "pass",
  });

  try {
    const config = loadResolvedConfigFromPath(configPath);
    checks.push({
      detail: `plugins: ${config.pluginIds.join(", ")}`,
      name: "Config load (jiti)",
      status: "pass",
    });
    if (config.ai) {
      const provider = ProviderRegistry.findProvider(config.ai.provider);
      const preferredAgent = getPreferredAgent();
      let providerDetail: string;
      if (config.ai.provider === "auto" && preferredAgent) {
        providerDetail = `using ${preferredAgent}`;
      } else if (provider) {
        providerDetail = "Available";
      } else {
        providerDetail = "Not available";
      }
      checks.push({
        detail: providerDetail,
        name: `AI provider: ${config.ai.provider}`,
        status: provider ? "pass" : "fail",
      });
    } else {
      checks.push({
        detail: "No aiSuggest plugin (offline / manual only)",
        name: "AI",
        status: "pass",
      });
    }
  } catch (error) {
    let msg: string;
    if (error instanceof ConfigLoadError) {
      msg = error.message;
    } else if (error instanceof Error) {
      msg = error.message;
    } else {
      msg = String(error);
    }
    checks.push({
      detail: msg,
      name: "Config load (jiti)",
      status: "fail",
    });
  }
}

export const runDoctor = async (cwd: string = process.cwd()): Promise<void> => {
  p.intro("better-commit doctor");

  const gitOk = isGitRepo(cwd);
  const checks: CheckRow[] = [
    {
      detail: process.version,
      name: "Node.js",
      status: "pass",
    },
    {
      detail: gitOk ? undefined : "Not a git repo",
      name: "Git repository",
      status: gitOk ? "pass" : "fail",
    },
  ];

  if (gitOk) {
    const staged = await hasStagedFiles(cwd);
    checks.push({
      detail: staged ? "Has staged changes" : "No staged files",
      name: "Staged files",
      status: "pass",
    });
  }

  addConfigChecks(checks, cwd);

  const detectedAgents = await detectInstalledAgents();
  checks.push({
    detail:
      detectedAgents.length > 0 ? detectedAgents.join(", ") : "None detected",
    name: "Detected agents",
    status: "pass",
  });

  const providers = ProviderRegistry.getProviders();
  checks.push({
    detail: providers.map((prov) => prov.name).join(", ") || "None",
    name: "Registered providers",
    status: providers.length > 0 ? "pass" : "fail",
  });

  for (const check of checks) {
    const icon = check.status === "pass" ? "✓" : "✗";
    const detail = check.detail ? ` (${check.detail})` : "";
    console.log(`  ${icon} ${check.name}${detail}`);
  }

  const failed = checks.filter((c) => c.status === "fail");
  if (failed.length === 0) {
    p.outro("All checks passed");
    exitSuccess();
  }

  p.outro(`${failed.length} check(s) failed`);
  exitFailure();
};
