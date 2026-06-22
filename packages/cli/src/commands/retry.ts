import * as p from "@clack/prompts";

import { ConfigLoadError, loadResolvedConfig } from "../config/load.js";
import type { CommitCache } from "../core/cache.js";
import { readCache } from "../core/cache.js";
import { formatCommitMessage } from "../core/commit-format.js";
import { ensureValidMessageOrExit } from "../core/ensure-valid-message.js";
import { exitFailure } from "../core/exit.js";
import {
  commit as gitCommit,
  hasStagedFiles,
  isGitRepo,
  stageAll,
} from "../core/git.js";
import { confirmStageAll } from "../prompts/interactive.js";

export interface RetryOptions {
  cwd?: string;
}

export const runRetry = async (options: RetryOptions): Promise<void> => {
  const cwd = options.cwd ?? process.cwd();

  p.intro("better-commit retry");

  if (!isGitRepo(cwd)) {
    p.cancel("Not a git repository");
    exitFailure();
  }

  const cache = readCache(cwd);
  if (!cache) {
    p.cancel("No cached commit data. Run 'bc commit' first.");
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

  const c = cache as CommitCache;

  let staged = await hasStagedFiles(cwd);
  if (!staged) {
    const stage = await confirmStageAll();
    if (!stage) {
      p.cancel("Nothing to commit");
      exitFailure();
    }
    await stageAll(cwd);
    staged = await hasStagedFiles(cwd);
    if (!staged) {
      p.cancel("Nothing to commit");
      exitFailure();
    }
  }

  const message = formatCommitMessage(c.type, c.scope, c.subject, {
    body: c.body,
    breaking: c.breaking,
    breakingChange: c.breakingChange,
  });

  ensureValidMessageOrExit(message, config);

  try {
    await gitCommit(message, cwd);
    p.outro(`Committed: ${message.split("\n")[0]}`);
  } catch (error) {
    p.log.error(String(error));
    exitFailure();
  }
};
