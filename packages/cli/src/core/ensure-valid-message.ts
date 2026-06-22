import * as p from "@clack/prompts";

import type { ResolvedCommitConfig } from "../config/types.js";
import { exitFailure } from "./exit.js";
import { validateCommitMessage } from "./validate-commit.js";

export const validateMessageForCommit = (
  message: string,
  config: ResolvedCommitConfig
) => validateCommitMessage(message, config);

export const ensureValidMessageOrExit = (
  message: string,
  config: ResolvedCommitConfig
): void => {
  const result = validateCommitMessage(message, config);
  for (const warn of result.warnings) {
    p.log.warn(warn);
  }
  if (!result.valid) {
    for (const err of result.errors) {
      p.log.error(err);
    }
    p.cancel("Commit message failed validation");
    exitFailure();
  }
};
