import * as p from "@clack/prompts";

import { exitFailure, exitSuccess } from "../exit.js";

export const showAiContext = (isAiSuggested: boolean): void => {
  if (!isAiSuggested) {
    return;
  }
  p.note("Edit any field or press Enter to accept.", "AI suggestions");
  p.log.step("Review and edit");
};

export const selectType = async (
  types: string[],
  suggested?: string,
  isAiSuggested?: boolean
): Promise<string> => {
  let ordered: string[];
  if (suggested && types.includes(suggested)) {
    ordered = [suggested, ...types.filter((t) => t !== suggested)];
  } else if (suggested) {
    ordered = [suggested, ...types];
  } else {
    ordered = types;
  }
  const message = "Select commit type";
  const result = await p.select({
    message,
    options: ordered.map((t) => ({
      hint:
        isAiSuggested && suggested && t === suggested
          ? "AI suggested"
          : undefined,
      label: t,
      value: t,
    })),
  });
  if (p.isCancel(result)) {
    exitSuccess();
  }
  return result as string;
};

export const inputScope = async (suggested = ""): Promise<string> => {
  const message = "Scope (optional)";
  const result = await p.text({
    initialValue: suggested,
    message,
    placeholder: "e.g. api, auth",
  });
  if (p.isCancel(result)) {
    exitSuccess();
  }
  return (result as string) ?? "";
};

export const inputSubject = async (initial?: string): Promise<string> => {
  const message = "Subject";
  const result = await p.text({
    initialValue: initial ?? "",
    message,
    placeholder: "short description",
  });
  if (p.isCancel(result)) {
    exitSuccess();
  }
  const value = (result as string)?.trim();
  if (!value) {
    p.cancel("Subject is required");
    exitFailure();
  }
  return value;
};

export const confirmMessage = async (message: string): Promise<boolean> => {
  const result = await p.confirm({
    initialValue: true,
    message: `Commit with: ${message}`,
  });
  if (p.isCancel(result)) {
    exitSuccess();
  }
  return result as boolean;
};

export const confirmStageAll = async (): Promise<boolean> => {
  const result = await p.confirm({
    initialValue: true,
    message: "No staged files. Stage all changes?",
  });
  if (p.isCancel(result)) {
    exitSuccess();
  }
  return result as boolean;
};

export const selectUseAI = async (): Promise<boolean> => {
  const result = await p.confirm({
    initialValue: true,
    message: "Generate message with AI?",
  });
  if (p.isCancel(result)) {
    exitSuccess();
  }
  return result as boolean;
};

export const confirmBreakingChange = async (
  initial = false
): Promise<boolean> => {
  const message = "Breaking change?";
  const result = await p.confirm({
    initialValue: initial,
    message,
  });
  if (p.isCancel(result)) {
    exitSuccess();
  }
  return result as boolean;
};

export const inputBody = async (initial = ""): Promise<string> => {
  const message = "Body (optional)";
  const result = await p.text({
    initialValue: initial,
    message,
    placeholder: "Multi-line description",
  });
  if (p.isCancel(result)) {
    exitSuccess();
  }
  return (result as string)?.trim() ?? "";
};

export const inputBreakingChange = async (initial = ""): Promise<string> => {
  const message = "Breaking change description";
  const result = await p.text({
    initialValue: initial,
    message,
    placeholder: "Describe what changed",
  });
  if (p.isCancel(result)) {
    exitSuccess();
  }
  return (result as string)?.trim() ?? "";
};
