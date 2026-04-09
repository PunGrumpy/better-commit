import * as p from "@clack/prompts";

import { ConfigLoadError, loadResolvedConfig } from "../config/load.js";
import type { ValidationResult } from "../config/types.js";
import { exitFailure, exitSuccess } from "../core/exit.js";
import {
  getCommitEditMessage,
  getCommitsInRange,
  getLastCommitMessage,
  isGitRepo,
} from "../core/git.js";
import { validateCommitMessage } from "../core/validate-commit.js";

export interface CheckOptions {
  cwd?: string;
  edit?: boolean;
  from?: string;
  to?: string;
}

const reportValidationResult = (
  result: ValidationResult,
  context: string
): void => {
  if (result.valid && result.warnings.length === 0) {
    p.outro("Valid");
    exitSuccess();
  }
  if (!result.valid) {
    console.error(`  ✗ ${context}`);
    for (const err of result.errors) {
      console.error(`    - ${err}`);
    }
    for (const warn of result.warnings) {
      console.error(`    - ${warn}`);
    }
    exitFailure();
  }
  for (const warn of result.warnings) {
    console.error(`  ⚠ ${warn}`);
  }
  p.outro("Valid (with warnings)");
  exitSuccess();
};

export const runCheck = async (options: CheckOptions): Promise<void> => {
  const cwd = options.cwd ?? process.cwd();

  p.intro("better-commit check");

  if (!isGitRepo(cwd)) {
    p.cancel("Not a git repository");
    exitFailure();
  }

  const hasFrom = options.from !== undefined;
  const hasTo = options.to !== undefined;
  if (hasFrom !== hasTo) {
    p.log.error(
      "Pass both --from and --to together to validate a commit range."
    );
    exitFailure();
  }
  if (options.edit && (hasFrom || hasTo)) {
    p.log.error(
      "Use only one mode: --edit, or --from/--to together, or default (last commit)."
    );
    exitFailure();
  }

  let config;
  try {
    ({ config } = loadResolvedConfig(cwd));
  } catch (error) {
    if (error instanceof ConfigLoadError) {
      p.log.error(error.message);
      exitFailure();
    }
    throw error;
  }

  if (options.edit) {
    const message = getCommitEditMessage(cwd);
    if (!message.trim()) {
      p.cancel("No message in COMMIT_EDITMSG");
      exitFailure();
    }
    const result = validateCommitMessage(message, config);
    reportValidationResult(result, "Invalid commit message");
  } else if (hasFrom && hasTo) {
    const commits = await getCommitsInRange(options.from, options.to, cwd);
    let hasFailure = false;
    for (const { hash, message } of commits) {
      const result = validateCommitMessage(message, config);
      if (!result.valid) {
        hasFailure = true;
        console.error(`  ✗ ${hash} invalid`);
        for (const err of result.errors) {
          console.error(`    - ${err}`);
        }
      }
    }
    if (hasFailure) {
      p.outro("Validation failed");
      exitFailure();
    }
    p.outro("All commits valid");
    exitSuccess();
  }

  const message = await getLastCommitMessage(cwd);
  if (!message.trim()) {
    p.cancel("No commits yet");
    exitFailure();
  }

  const result = validateCommitMessage(message, config);
  reportValidationResult(result, "Last commit invalid");
};
