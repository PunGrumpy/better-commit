import * as p from "@clack/prompts";

import { resolveProvider } from "../ai/index.js";
import { ConfigLoadError, loadResolvedConfig } from "../config/load.js";
import type { ResolvedCommitConfig } from "../config/types.js";
import { writeCache } from "../core/cache.js";
import { parseCommitMessage } from "../core/commit-format.js";
import { ensureValidMessageOrExit } from "../core/ensure-valid-message.js";
import { exitCancel, exitFailure, exitSuccess } from "../core/exit.js";
import {
  commit as gitCommit,
  getStagedDiff,
  getUnstagedFiles,
  hasStagedFiles,
  isGitRepo,
  stageFiles,
  writeHookCommitMessage,
} from "../core/git.js";
import { prepareDiffForAi } from "../core/prepare-diff-for-ai.js";
import { getCommitPromptAsync } from "../prompts/commit-prompt.js";
import {
  collectFormFields,
  formFieldsToMessage,
} from "../prompts/form-fields.js";
import type { FormFields } from "../prompts/form-fields.js";
import {
  confirmMessage,
  selectUseAI,
  stageChangesPrompt,
} from "../prompts/interactive.js";

export interface CommitOptions {
  cwd?: string;
  dryRun?: boolean;
  hookMessagePath?: string;
  noAi?: boolean;
}

const ensureStaged = async (cwd: string): Promise<void> => {
  let staged = await hasStagedFiles(cwd);
  if (staged) {
    return;
  }

  const unstagedFiles = await getUnstagedFiles(cwd);
  if (unstagedFiles.length === 0) {
    p.cancel("No changes to commit (working directory is clean)");
    exitFailure();
  }

  const filesToStage = await stageChangesPrompt(unstagedFiles);
  if (!filesToStage || filesToStage.length === 0) {
    p.cancel("No staged files");
    exitFailure();
    return;
  }

  await stageFiles(filesToStage, cwd);
  staged = await hasStagedFiles(cwd);
  if (!staged) {
    p.cancel("Nothing to commit");
    exitFailure();
  }
};

interface MinimalAiProvider {
  generateMessage: (
    diff: string,
    options: {
      customPrompt?: string;
      model?: string;
      preferredAgent?: string;
    }
  ) => Promise<string>;
}

const generateCommitFields = async (
  config: ResolvedCommitConfig,
  preparedDiff: string,
  useAi: boolean,
  effectiveProvider: MinimalAiProvider | null | undefined,
  preferredAgent: string | null | undefined,
  providerName: string
): Promise<FormFields> => {
  if (useAi && effectiveProvider) {
    const spinner = p.spinner();
    spinner.start(`Generating message with ${providerName}...`);
    try {
      const rawMessage = await effectiveProvider.generateMessage(preparedDiff, {
        customPrompt: config.ai?.customPrompt,
        model: config.ai?.model,
        preferredAgent: preferredAgent ?? undefined,
      });
      spinner.stop("Generated");
      const parsed = parseCommitMessage(rawMessage);
      return await collectFormFields(config, parsed, true);
    } catch (error) {
      spinner.stop("Failed");
      p.log.error(`Generation failed (${providerName}): ${String(error)}`);
      return await collectFormFields(config, null, false);
    }
  }
  return await collectFormFields(config, null, false);
};

export const runCommit = async (options: CommitOptions): Promise<void> => {
  const cwd = options.cwd ?? process.cwd();
  const { hookMessagePath } = options;

  if (hookMessagePath !== undefined) {
    process.env.BETTER_COMMIT_HOOK_MODE = "1";
  }

  p.intro("better-commit");

  if (!isGitRepo(cwd)) {
    p.cancel("Not a git repository");
    exitFailure();
  }

  if (hookMessagePath === undefined) {
    await ensureStaged(cwd);
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

  const [diff] = await Promise.all([
    getStagedDiff(cwd),
    getCommitPromptAsync(),
  ]);

  const preparedDiff = prepareDiffForAi(diff, config);

  const { effectiveProvider, preferredAgent, providerName, useAi } =
    await resolveProvider(config, options, selectUseAI);

  const fields = await generateCommitFields(
    config,
    preparedDiff,
    useAi,
    effectiveProvider,
    preferredAgent,
    providerName
  );

  const message = formFieldsToMessage(fields);
  await ensureValidMessageOrExit(message, config);

  const confirmed = await confirmMessage(message);
  if (!confirmed) {
    p.cancel("Commit cancelled");
    exitCancel();
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

  let finalMessage = message;
  const prepareHooks = config.hooks?.prepareMessage ?? [];
  for (const hook of prepareHooks) {
    // eslint-disable-next-line no-await-in-loop -- plugin prepare hooks run sequentially
    finalMessage = await hook(finalMessage);
  }

  await ensureValidMessageOrExit(finalMessage, config);

  if (options.dryRun) {
    p.outro(`[dry-run] Would commit: ${finalMessage}`);
    exitSuccess();
  }

  if (hookMessagePath !== undefined) {
    writeHookCommitMessage(hookMessagePath, finalMessage);
    p.outro(`Prepared: ${finalMessage.split("\n")[0] ?? finalMessage}`);
    exitSuccess();
  }

  try {
    await gitCommit(finalMessage, cwd);
    p.outro(`Committed: ${finalMessage}`);
  } catch (error) {
    p.log.error(String(error));
    exitFailure();
  }
};
