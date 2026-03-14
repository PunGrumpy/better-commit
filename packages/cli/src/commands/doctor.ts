import * as p from "@clack/prompts";

import { detectInstalledAgents, getPreferredAgent } from "../agents.js";
import { findConfigPath, loadConfig } from "../config.js";
import { isGitRepo, hasStagedFiles } from "../git.js";
import { ProviderRegistry } from "../providers/index.js";

export const runDoctor = async (cwd: string = process.cwd()): Promise<void> => {
  p.intro("better-commit doctor");

  const checks: { name: string; status: "pass" | "fail"; detail?: string }[] =
    [];

  const gitOk = isGitRepo(cwd);
  checks.push({
    detail: gitOk ? undefined : "Not a git repo",
    name: "Git repository",
    status: gitOk ? "pass" : "fail",
  });

  if (gitOk) {
    const staged = await hasStagedFiles(cwd);
    checks.push({
      detail: staged ? "Has staged changes" : "No staged files",
      name: "Staged files",
      status: staged ? "pass" : "fail",
    });
  }

  const configPath = findConfigPath(cwd);
  checks.push({
    detail: configPath ?? "Using defaults",
    name: "Config file",
    status: "pass",
  });

  const detectedAgents = await detectInstalledAgents();
  checks.push({
    detail:
      detectedAgents.length > 0 ? detectedAgents.join(", ") : "None detected",
    name: "Detected agents",
    status: detectedAgents.length > 0 ? "pass" : "fail",
  });

  const config = await loadConfig(cwd);
  const provider = ProviderRegistry.findProvider(config.provider);
  const preferredAgent = getPreferredAgent();
  let providerDetail: string;
  if (config.provider === "auto" && preferredAgent) {
    providerDetail = `using ${preferredAgent}`;
  } else if (provider) {
    providerDetail = "Available";
  } else {
    providerDetail = "Not available";
  }
  checks.push({
    detail: providerDetail,
    name: `Provider: ${config.provider}`,
    status: provider ? "pass" : "fail",
  });

  const providers = ProviderRegistry.getProviders();
  checks.push({
    detail: providers.map((prov) => prov.name).join(", ") || "None",
    name: "AI providers",
    status: providers.length > 0 ? "pass" : "fail",
  });

  for (const check of checks) {
    const icon = check.status === "pass" ? "✓" : "✗";
    const detail = check.detail ? ` (${check.detail})` : "";
    console.log(`  ${icon} ${check.name}${detail}`);
  }

  const failed = checks.filter((c) => c.status === "fail");
  p.outro(
    failed.length === 0
      ? "All checks passed"
      : `${failed.length} check(s) failed`
  );
};
