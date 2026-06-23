import * as p from "@clack/prompts";

import { exitCancel, exitFailure } from "../core/exit.js";

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
    exitCancel();
  }
  return result as string;
};

export const inputScope = async (
  allowedScopes: string[] | undefined,
  strictScopes: boolean,
  suggested = ""
): Promise<string> => {
  if (allowedScopes && allowedScopes.length > 0 && strictScopes) {
    let ordered: string[];
    if (suggested && allowedScopes.includes(suggested)) {
      ordered = [suggested, ...allowedScopes.filter((s) => s !== suggested)];
    } else if (suggested) {
      ordered = [suggested, ...allowedScopes];
    } else {
      ordered = [...allowedScopes];
    }
    const result = await p.select({
      message: "Scope (optional)",
      options: [
        { label: "(none)", value: "" },
        ...ordered.map((s) => ({ label: s, value: s })),
      ],
    });
    if (p.isCancel(result)) {
      exitCancel();
    }
    return result as string;
  }

  const placeholder =
    allowedScopes && allowedScopes.length > 0
      ? `e.g. ${allowedScopes.slice(0, 3).join(", ")}`
      : "e.g. api, auth";
  const message = "Scope (optional)";
  const result = await p.text({
    initialValue: suggested,
    message,
    placeholder,
  });
  if (p.isCancel(result)) {
    exitCancel();
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
    exitCancel();
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
    exitCancel();
  }
  return result as boolean;
};

const promptSelectFiles = async (
  unstagedFiles: string[],
  message: string
): Promise<string[]> => {
  const result = await p.multiselect({
    initialValues: unstagedFiles,
    message,
    options: unstagedFiles.map((file) => ({
      label: file,
      value: file,
    })),
    required: false,
  });

  if (p.isCancel(result)) {
    exitCancel();
  }

  return result as string[];
};

export const stageChangesPrompt = async (
  unstagedFiles: string[]
): Promise<string[] | false> => {
  if (unstagedFiles.length === 0) {
    return [];
  }

  if (unstagedFiles.length <= 10) {
    return promptSelectFiles(
      unstagedFiles,
      "No staged files. Select files to stage:"
    );
  }

  const choice = await p.select({
    message: `No staged files. Found ${unstagedFiles.length} unstaged files. How would you like to proceed?`,
    options: [
      {
        label: "Stage all files and commit",
        value: "all",
      },
      {
        label: "Select files to stage...",
        value: "interactive",
      },
    ],
  });

  if (p.isCancel(choice)) {
    exitCancel();
  }

  if (choice === "all") {
    return unstagedFiles;
  }

  if (choice === "interactive") {
    return promptSelectFiles(unstagedFiles, "Select files to stage:");
  }

  return false;
};

export const selectUseAI = async (): Promise<boolean> => {
  const result = await p.confirm({
    initialValue: true,
    message: "Generate message with AI?",
  });
  if (p.isCancel(result)) {
    exitCancel();
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
    exitCancel();
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
    exitCancel();
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
    exitCancel();
  }
  return (result as string)?.trim() ?? "";
};
