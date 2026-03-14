import { writeFileSync } from "node:fs";
import { join } from "node:path";

import * as p from "@clack/prompts";

import { loadConfig, DEFAULT_CONFIG } from "../config.js";
import { exitSuccess } from "../exit.js";

export interface InitOptions {
  quiet?: boolean;
  cwd?: string;
}

export const runInit = async (options: InitOptions): Promise<void> => {
  const cwd = options.cwd ?? process.cwd();
  const configPath = join(cwd, ".better-commit.json");

  const existing = await loadConfig(cwd);
  const hasExisting =
    Object.keys(existing).length > 0 &&
    JSON.stringify(existing) !== JSON.stringify(DEFAULT_CONFIG);

  if (hasExisting && !options.quiet) {
    const overwrite = await p.confirm({
      initialValue: false,
      message: ".better-commit.json exists. Overwrite?",
    });
    if (p.isCancel(overwrite)) {
      exitSuccess();
    }
    if (!overwrite) {
      return;
    }
  }

  const config = {
    allowUnsanitized: false,
    conventionalTypes: DEFAULT_CONFIG.conventionalTypes,
    provider: "auto",
  };

  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
  if (!options.quiet) {
    p.outro(`Created ${configPath}`);
  }
};
