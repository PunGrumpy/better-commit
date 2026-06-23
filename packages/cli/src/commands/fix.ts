import * as p from "@clack/prompts";

import { resolveProvider } from "../ai/index.js";
import { ConfigLoadError, loadResolvedConfig } from "../config/load.js";
import type { ValidationResult } from "../config/types.js";
import { parseCommitMessage } from "../core/commit-format.js";
import { ensureValidMessageOrExit } from "../core/ensure-valid-message.js";
import { exitFailure, exitSuccess } from "../core/exit.js";
import {
  commitAmend,
  getLastCommitDiff,
  getLastCommitMessage,
  isGitRepo,
} from "../core/git.js";
import { prepareDiffForAi } from "../core/prepare-diff-for-ai.js";
import { validateCommitMessage } from "../core/validate-commit.js";
import { getCommitPromptAsync } from "../prompts/commit-prompt.js";
import {
  collectFormFields,
  formFieldsToMessage,
} from "../prompts/form-fields.js";
import { confirmMessage, selectUseAI } from "../prompts/interactive.js";

export interface FixOptions {
  cwd?: string;
  noAi?: boolean;
}

const ensureFixNeeded = async (validation: ValidationResult): Promise<void> => {
  if (validation.valid && validation.warnings.length === 0) {
    const fixAnyway = await p.confirm({
      initialValue: false,
      message: "Last commit is valid. Fix anyway?",
    });
    if (p.isCancel(fixAnyway)) {
      exitSuccess();
    }
    if (!fixAnyway) {
      p.outro("Nothing to fix");
      exitSuccess();
    }
  }
};

export const runFix = async (options: FixOptions): Promise<void> => {
  const cwd = options.cwd ?? process.cwd();

  p.intro("better-commit fix");

  if (!isGitRepo(cwd)) {
    p.cancel("Not a git repository");
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

  const [lastMessage, lastCommitDiff] = await Promise.all([
    getLastCommitMessage(cwd),
    getLastCommitDiff(cwd),
    getCommitPromptAsync(),
  ]);
  if (!lastMessage.trim()) {
    p.cancel("No commits yet");
    exitFailure();
  }

  const validation = await validateCommitMessage(lastMessage, config);

  await ensureFixNeeded(validation);

  let message: string;

  const { effectiveProvider, preferredAgent, providerName, useAi } =
    await resolveProvider(config, options, selectUseAI);

  if (useAi && effectiveProvider) {
    const preparedDiff = prepareDiffForAi(
      lastCommitDiff || lastMessage,
      config
    );
    const spinner = p.spinner();
    spinner.start(`Generating fix with ${providerName}...`);
    try {
      const rawMessage = await effectiveProvider.generateMessage(preparedDiff, {
        customPrompt: config.ai?.customPrompt,
        existingMessage: lastMessage,
        model: config.ai?.model,
        preferredAgent: preferredAgent ?? undefined,
      });
      spinner.stop("Generated");
      const parsed = parseCommitMessage(rawMessage);
      const fields = await collectFormFields(config, parsed, true);
      message = formFieldsToMessage(fields);
    } catch (error) {
      spinner.stop("Failed");
      p.log.error(`Generation failed: ${String(error)}`);
      const fields = await collectFormFields(config, null, false);
      message = formFieldsToMessage(fields);
    }
  } else {
    const parsed = parseCommitMessage(lastMessage);
    const fields = await collectFormFields(config, parsed, false);
    message = formFieldsToMessage(fields);
  }

  const confirmed = await confirmMessage(message);
  if (!confirmed) {
    p.cancel("Fix cancelled");
    exitSuccess();
  }

  let finalMessage = message;
  const prepareHooks = config.hooks?.prepareMessage ?? [];
  for (const hook of prepareHooks) {
    // eslint-disable-next-line no-await-in-loop -- plugin prepare hooks run sequentially
    finalMessage = await hook(finalMessage);
  }

  await ensureValidMessageOrExit(finalMessage, config);

  try {
    await commitAmend(finalMessage, cwd);
    p.outro(`Amended: ${finalMessage.split("\n")[0]}`);
  } catch (error) {
    p.log.error(String(error));
    exitFailure();
  }
};
