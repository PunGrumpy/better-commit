import { existsSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

import * as p from "@clack/prompts";

import { exitFailure, exitSuccess } from "../core/exit.js";

const COMMIT_CONFIG_FILENAME = "commit.config.ts";

const TEMPLATE = `import {
  aiSuggest,
  conventionalCommits,
  defineConfig,
} from "better-commit/config";

export default defineConfig({
  plugins: [
    conventionalCommits({
      types: [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "perf",
        "ci",
        "build",
      ],
    }),
    aiSuggest({ provider: "auto" }),
  ],
});
`;

export interface InitOptions {
  cwd?: string;
  force?: boolean;
  quiet?: boolean;
}

export const runInit = async (options: InitOptions): Promise<void> => {
  const cwd = options.cwd ?? process.cwd();
  const configPath = join(cwd, COMMIT_CONFIG_FILENAME);

  const existing = existsSync(configPath);
  if (existing && options.quiet && !options.force) {
    console.error(
      `${COMMIT_CONFIG_FILENAME} already exists. Use --force with --quiet to overwrite, or run without --quiet to confirm.`
    );
    exitFailure();
  }
  if (existing && !options.quiet) {
    const overwrite = await p.confirm({
      initialValue: false,
      message: `${COMMIT_CONFIG_FILENAME} exists. Overwrite?`,
    });
    if (p.isCancel(overwrite)) {
      exitSuccess();
    }
    if (!overwrite) {
      return;
    }
  }

  writeFileSync(configPath, TEMPLATE, "utf-8");
  if (!options.quiet) {
    p.outro(`Created ${basename(configPath)}`);
  }
};
