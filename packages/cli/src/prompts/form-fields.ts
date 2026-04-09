import type { ResolvedCommitConfig } from "../config/types.js";
import type { ParsedCommitMessage } from "../core/commit-format.js";
import { formatCommitMessage } from "../core/commit-format.js";
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
  config: ResolvedCommitConfig,
  parsed: ParsedCommitMessage | null,
  isAiSuggested: boolean
): Promise<FormFields> => {
  showAiContext(isAiSuggested);
  const type = await selectType(
    config.rules.types,
    parsed?.type,
    isAiSuggested
  );
  const scope = await inputScope(
    config.rules.scopes,
    config.rules.strictScopes,
    parsed?.scope ?? ""
  );
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
