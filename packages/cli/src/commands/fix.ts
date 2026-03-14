import * as p from "@clack/prompts";

import { parseCommitMessage } from "../commit-format.js";
import { loadConfig } from "../config.js";
import { exitFailure, exitSuccess } from "../exit.js";
import {
  isGitRepo,
  getLastCommitMessage,
  getLastCommitDiff,
  commitAmend,
} from "../git.js";
import { getCommitPromptAsync } from "../prompts/commit-prompt.js";
import {
  collectFormFields,
  formFieldsToMessage,
} from "../prompts/form-fields.js";
import { confirmMessage } from "../prompts/interactive.js";
import { resolveProvider } from "../providers/resolve.js";
import { sanitizeDiff, truncateDiff } from "../sanitize.js";
import { validateCommitMessage } from "../validate.js";

export interface FixOptions {
  noAi?: boolean;
  cwd?: string;
}

export const runFix = async (options: FixOptions): Promise<void> => {
  const cwd = options.cwd ?? process.cwd();

  p.intro("better-commit fix");

  if (!isGitRepo(cwd)) {
    p.cancel("Not a git repository");
    exitFailure();
  }

  const [lastMessage, config, lastCommitDiff] = await Promise.all([
    getLastCommitMessage(cwd),
    loadConfig(cwd),
    getLastCommitDiff(cwd),
    /* Warm prompt cache */
    getCommitPromptAsync(),
  ]);
  if (!lastMessage.trim()) {
    p.cancel("No commits yet");
    exitFailure();
  }

  const validation = validateCommitMessage(lastMessage, config);

  let message: string;

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

  const { effectiveProvider, preferredAgent, providerName, useAi } =
    await resolveProvider(config, options);

  if (useAi && effectiveProvider) {
    const truncated = truncateDiff(lastCommitDiff || lastMessage);
    const sanitized = sanitizeDiff(truncated);
    const spinner = p.spinner();
    spinner.start(`Generating fix with ${providerName}...`);
    try {
      const rawMessage = await effectiveProvider.generateMessage(sanitized, {
        customPrompt: config.customPrompt,
        existingMessage: lastMessage,
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

  try {
    await commitAmend(message, cwd);
    p.outro(`Amended: ${message.split("\n")[0]}`);
  } catch (error) {
    p.log.error(String(error));
    exitFailure();
  }
};
