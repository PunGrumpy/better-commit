import * as p from "@clack/prompts";

import { loadConfig } from "../config.js";
import { exitFailure, exitSuccess } from "../exit.js";
import {
  getLastCommitMessage,
  getCommitEditMessage,
  getCommitsInRange,
  isGitRepo,
} from "../git.js";
import type { ValidationResult } from "../validate.js";
import { validateCommitMessage } from "../validate.js";

export interface CheckOptions {
  edit?: boolean;
  from?: string;
  to?: string;
  cwd?: string;
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

  const config = await loadConfig(cwd);

  if (options.edit) {
    const message = getCommitEditMessage(cwd);
    if (!message.trim()) {
      p.cancel("No message in COMMIT_EDITMSG");
      exitFailure();
    }
    const result = validateCommitMessage(message, config);
    reportValidationResult(result, "Invalid commit message");
  }

  if (options.from !== undefined && options.to !== undefined) {
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
