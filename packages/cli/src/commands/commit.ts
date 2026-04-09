import * as p from "@clack/prompts";

import { resolveProvider } from "../ai/index.js";
import { ConfigLoadError, loadResolvedConfig } from "../config/load.js";
import { writeCache } from "../core/cache.js";
import { parseCommitMessage } from "../core/commit-format.js";
import { exitFailure, exitSuccess } from "../core/exit.js";
import {
  commit as gitCommit,
  getStagedDiff,
  hasStagedFiles,
  isGitRepo,
  stageAll,
} from "../core/git.js";
import { sanitizeDiff, truncateDiff } from "../core/sanitize.js";
import { getCommitPromptAsync } from "../prompts/commit-prompt.js";
import {
  collectFormFields,
  formFieldsToMessage,
} from "../prompts/form-fields.js";
import type { FormFields } from "../prompts/form-fields.js";
import {
  confirmMessage,
  confirmStageAll,
  selectUseAI,
} from "../prompts/interactive.js";

export interface CommitOptions {
  cwd?: string;
  dryRun?: boolean;
  noAi?: boolean;
}

const ensureStaged = async (cwd: string): Promise<void> => {
  let staged = await hasStagedFiles(cwd);
  if (staged) {
    return;
  }
  const stage = await confirmStageAll();
  if (!stage) {
    p.cancel("No staged files");
    exitFailure();
  }
  await stageAll(cwd);
  staged = await hasStagedFiles(cwd);
  if (!staged) {
    p.cancel("Nothing to commit");
    exitFailure();
  }
};

export const runCommit = async (options: CommitOptions): Promise<void> => {
  const cwd = options.cwd ?? process.cwd();

  p.intro("better-commit");

  if (!isGitRepo(cwd)) {
    p.cancel("Not a git repository");
    exitFailure();
  }

  await ensureStaged(cwd);

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

  const [diff] = await Promise.all([
    getStagedDiff(cwd),
    getCommitPromptAsync(),
  ]);

  const truncated = truncateDiff(diff);
  const sanitized = sanitizeDiff(truncated);

  const { effectiveProvider, preferredAgent, providerName, useAi } =
    await resolveProvider(config, options, selectUseAI);

  let fields: FormFields;
  if (useAi && effectiveProvider) {
    const spinner = p.spinner();
    spinner.start(`Generating message with ${providerName}...`);
    try {
      const rawMessage = await effectiveProvider.generateMessage(sanitized, {
        customPrompt: config.ai?.customPrompt,
        preferredAgent: preferredAgent ?? undefined,
      });
      spinner.stop("Generated");
      const parsed = parseCommitMessage(rawMessage);
      fields = await collectFormFields(config, parsed, true);
    } catch (error) {
      spinner.stop("Failed");
      p.log.error(`Generation failed (${providerName}): ${String(error)}`);
      fields = await collectFormFields(config, null, false);
    }
  } else {
    fields = await collectFormFields(config, null, false);
  }

  const message = formFieldsToMessage(fields);

  const confirmed = await confirmMessage(message);
  if (!confirmed) {
    p.cancel("Commit cancelled");
    exitSuccess();
  }

  await writeCache(
    {
      body: fields.body || undefined,
      breaking: fields.breaking,
      breakingChange: fields.breakingChange || undefined,
      scope: fields.scope,
      subject: fields.subject,
      type: fields.type,
    },
    cwd
  );

  if (options.dryRun) {
    p.outro(`[dry-run] Would commit: ${message}`);
    exitSuccess();
  }

  try {
    await gitCommit(message, cwd);
    p.outro(`Committed: ${message}`);
  } catch (error) {
    p.log.error(String(error));
    exitFailure();
  }
};
