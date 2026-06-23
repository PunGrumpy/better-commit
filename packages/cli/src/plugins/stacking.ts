import crypto from "node:crypto";

import type { BetterCommitPlugin, ValidationResult } from "../config/types.js";
import {
  formatCommitMessage,
  parseCommitMessage,
} from "../core/commit-format.js";

const generateChangeId = (): string =>
  `I${crypto.randomBytes(20).toString("hex")}`;

export interface StackingOptions {
  changeId?: boolean;
}

export const stacking = (options: StackingOptions = {}): BetterCommitPlugin => {
  const enableChangeId = options.changeId ?? true;

  return {
    apiVersion: 1,
    hooks: {
      prepareMessage: (message: string): string => {
        if (!enableChangeId) {
          return message;
        }

        const changeIdRegex = /\n*Change-Id:\s*I[0-9a-fA-F]{40}\s*$/iu;
        if (changeIdRegex.test(message)) {
          return message;
        }

        const parsed = parseCommitMessage(message);
        if (parsed) {
          return formatCommitMessage(
            parsed.type,
            parsed.scope,
            parsed.subject,
            {
              body: parsed.body,
              breaking: parsed.breaking,
              breakingChange: parsed.footer?.replace(
                /^BREAKING CHANGE:\s*/iu,
                ""
              ),
              changeId: generateChangeId(),
            }
          );
        }

        return `${message.trim()}\n\nChange-Id: ${generateChangeId()}`;
      },
      validateMessage: (message: string): ValidationResult => {
        const errors: string[] = [];

        if (enableChangeId && process.env.BETTER_COMMIT_CHECK_MODE === "1") {
          const changeIdRegex = /\n*Change-Id:\s*I[0-9a-fA-F]{40}\s*$/iu;
          if (!changeIdRegex.test(message)) {
            errors.push("Missing stable Change-Id footer in commit message.");
          }
        }

        return {
          errors,
          valid: errors.length === 0,
          warnings: [],
        };
      },
    },
    id: "stacking",
  };
};
