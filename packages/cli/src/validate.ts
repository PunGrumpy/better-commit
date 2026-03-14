import { parseCommitMessage } from "./commit-format.js";
import type { BetterCommitConfig } from "./config.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const DEFAULT_SUBJECT_MAX_LENGTH = 72;

/** Validates a commit message against conventional format and config. */
export const validateCommitMessage = (
  message: string,
  config: BetterCommitConfig,
  options?: { subjectMaxLength?: number }
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const subjectMaxLength =
    options?.subjectMaxLength ?? DEFAULT_SUBJECT_MAX_LENGTH;

  const trimmed = message.trim();
  if (!trimmed) {
    errors.push("Commit message is empty");
    return { errors, valid: false, warnings };
  }

  const headerLine = trimmed.split("\n")[0] ?? trimmed;
  const parsed = parseCommitMessage(headerLine);
  if (!parsed) {
    errors.push(
      "Invalid format: expected type(scope)?: subject (e.g. feat: add login)"
    );
    return { errors, valid: false, warnings };
  }

  const allowedTypes = config.conventionalTypes.map((t) => t.toLowerCase());
  const typeLower = parsed.type.toLowerCase();
  if (!allowedTypes.includes(typeLower)) {
    errors.push(
      `Type "${parsed.type}" not in allowed list: ${allowedTypes.join(", ")}`
    );
  }

  if (parsed.subject.length > subjectMaxLength) {
    warnings.push(
      `Subject exceeds ${subjectMaxLength} characters (${parsed.subject.length})`
    );
  }

  if (parsed.subject.endsWith(".")) {
    warnings.push("Subject should not end with a period");
  }

  return {
    errors,
    valid: errors.length === 0,
    warnings,
  };
};
