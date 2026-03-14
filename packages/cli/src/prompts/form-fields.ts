import type { ParsedCommitMessage } from "../commit-format.js";
import { formatCommitMessage } from "../commit-format.js";
import type { BetterCommitConfig } from "../config.js";
import {
  showAiContext,
  selectType,
  inputScope,
  inputSubject,
  confirmBreakingChange,
  inputBody,
  inputBreakingChange,
} from "./interactive.js";

export interface FormFields {
  body: string;
  breaking: boolean;
  breakingChange: string;
  scope: string;
  subject: string;
  type: string;
}

export const collectFormFields = async (
  config: BetterCommitConfig,
  parsed: ParsedCommitMessage | null,
  isAiSuggested: boolean
): Promise<FormFields> => {
  showAiContext(isAiSuggested);
  const type = await selectType(
    config.conventionalTypes,
    parsed?.type,
    isAiSuggested
  );
  const scope = await inputScope(parsed?.scope ?? "");
  const subject = await inputSubject(parsed?.subject ?? "");
  const breaking = await confirmBreakingChange(parsed?.breaking ?? false);
  let body = "";
  let breakingChange = "";
  if (breaking) {
    breakingChange = await inputBreakingChange(
      parsed?.footer?.replace(/^BREAKING CHANGE:\s*/i, "") ?? ""
    );
  } else {
    body = await inputBody(parsed?.body ?? "");
  }
  return { body, breaking, breakingChange, scope, subject, type };
};

export const formFieldsToMessage = (fields: FormFields): string =>
  formatCommitMessage(fields.type, fields.scope, fields.subject, {
    body: fields.body || undefined,
    breaking: fields.breaking,
    breakingChange: fields.breakingChange || undefined,
  });
