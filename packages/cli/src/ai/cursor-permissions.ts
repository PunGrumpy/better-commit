import * as p from "@clack/prompts";

export interface AcpPermissionOption {
  kind?: string;
  name: string;
  optionId: string;
}

export const mapPermissionOptionsToSelect = (
  options: AcpPermissionOption[]
): { label: string; value: string }[] =>
  options.map((option) => ({
    label: option.name,
    value: option.optionId,
  }));

export const isPermissionRejection = (
  optionId: string,
  options: AcpPermissionOption[]
): boolean => {
  const selected = options.find((option) => option.optionId === optionId);
  if (selected?.kind === "reject") {
    return true;
  }
  return (
    optionId === "reject-once" ||
    optionId === "reject" ||
    optionId === "deny" ||
    optionId === "deny-once"
  );
};

export const promptForCursorPermission = async (
  title: string,
  options: AcpPermissionOption[]
): Promise<string> => {
  const selectOptions = mapPermissionOptionsToSelect(options);
  if (selectOptions.length === 0) {
    throw new Error(`Cursor permission request has no options: ${title}`);
  }

  const result = await p.select({
    message: title,
    options: selectOptions,
  });

  if (p.isCancel(result)) {
    return "reject-once";
  }

  return result as string;
};

export const resolveCursorPermission = (
  title: string,
  options: AcpPermissionOption[]
): Promise<string> => {
  if (process.env.BETTER_COMMIT_CURSOR_AUTO_APPROVE === "1") {
    const allowOnce = options.find(
      (option) => option.optionId === "allow-once"
    );
    if (allowOnce) {
      return Promise.resolve("allow-once");
    }
    const firstAllow = options.find(
      (option) => option.kind === "allow" || option.optionId.startsWith("allow")
    );
    return Promise.resolve(
      firstAllow?.optionId ?? options[0]?.optionId ?? "allow-once"
    );
  }

  return promptForCursorPermission(title, options);
};
