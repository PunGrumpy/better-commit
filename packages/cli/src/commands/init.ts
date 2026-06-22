import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

import * as p from "@clack/prompts";

import { exitFailure, exitSuccess } from "../core/exit.js";
import { installHuskyHook } from "../integrations/husky.js";

const COMMIT_CONFIG_FILENAME = "commit.config.ts";

const TEMPLATE = `import {
  aiSuggest,
  conventionalCommits,
  defineConfig,
} from "@better-commit/cli/config";

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
  hooks?: boolean;
}

const setupHooks = async (cwd: string, options: InitOptions): Promise<void> => {
  let shouldInstallHooks = options.hooks ?? false;
  if (!options.quiet && !shouldInstallHooks) {
    const confirmHooks = await p.confirm({
      initialValue: false,
      message: "Install git hook for bc commit?",
    });
    if (p.isCancel(confirmHooks)) {
      exitSuccess();
    }
    if (confirmHooks) {
      shouldInstallHooks = true;
    }
  }

  if (shouldInstallHooks) {
    const hookPath = path.join(cwd, ".husky", "prepare-commit-msg");
    const hookExists = existsSync(hookPath);
    if (hookExists && !options.force) {
      if (options.quiet) {
        console.error(
          `.husky/prepare-commit-msg already exists. Use --force with --quiet to overwrite, or run without --quiet to confirm.`
        );
        exitFailure();
      } else {
        const overwriteHook = await p.confirm({
          initialValue: false,
          message: ".husky/prepare-commit-msg exists. Overwrite?",
        });
        if (p.isCancel(overwriteHook)) {
          exitSuccess();
        }
        if (!overwriteHook) {
          return;
        }
      }
    }
    installHuskyHook(cwd);
    console.log("Installed .husky/prepare-commit-msg");
  }
};

export const runInit = async (options: InitOptions): Promise<void> => {
  const cwd = options.cwd ?? process.cwd();
  const configPath = path.join(cwd, COMMIT_CONFIG_FILENAME);

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
    p.outro(`Created ${path.basename(configPath)}`);
  }

  await setupHooks(cwd, options);
};
