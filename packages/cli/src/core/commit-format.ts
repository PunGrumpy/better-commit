export interface ParsedCommitMessage {
  type: string;
  scope: string;
  subject: string;
  breaking?: boolean;
  body?: string;
  footer?: string;
  changeId?: string;
}

export const formatCommitMessage = (
  type: string,
  scope: string,
  subject: string,
  options?: {
    breaking?: boolean;
    body?: string;
    breakingChange?: string;
    changeId?: string;
  }
): string => {
  const typeWithBreaking = options?.breaking ? `${type}!` : type;
  const prefix = scope
    ? `${typeWithBreaking}(${scope}): `
    : `${typeWithBreaking}: `;
  let msg = `${prefix}${subject}`;
  if (options?.body?.trim()) {
    msg += `\n\n${options.body.trim()}`;
  }
  if (options?.breakingChange?.trim()) {
    msg += `\n\nBREAKING CHANGE: ${options.breakingChange.trim()}`;
  }
  if (options?.changeId?.trim()) {
    msg += `\n\nChange-Id: ${options.changeId.trim()}`;
  }
  return msg;
};

const parseBodyFooter = (
  rest: string
): { body?: string; footer?: string; changeId?: string } => {
  if (!rest) {
    return {};
  }
  let currentRest = rest.trim();
  let changeId: string | undefined;

  const changeIdMatch = currentRest.match(
    /\n*Change-Id:\s*(?<changeId>I[0-9a-fA-F]{40})\s*$/iu
  );
  if (changeIdMatch?.groups?.changeId) {
    ({ changeId } = changeIdMatch.groups);
    currentRest = currentRest
      .replace(/\n*Change-Id:\s*I[0-9a-fA-F]{40}\s*$/iu, "")
      .trim();
  }

  const breakingMatch = currentRest.match(
    /\n*BREAKING CHANGE:\s*(?<breaking>.+)$/su
  );
  if (breakingMatch?.groups) {
    const footer = `BREAKING CHANGE: ${breakingMatch.groups.breaking.trim()}`;
    const beforeBreaking = currentRest
      .replace(/\n*BREAKING CHANGE:\s*.+$/su, "")
      .trim();
    return {
      body: beforeBreaking || undefined,
      changeId,
      footer,
    };
  }
  return { body: currentRest || undefined, changeId };
};

/** Parses "type(scope): subject" or "type: subject" into components. */
export const parseCommitMessage = (
  message: string
): ParsedCommitMessage | null => {
  const trimmed = message.trim();
  const lines = trimmed.split("\n");
  const headerLine = lines[0] ?? "";
  const rest = lines.slice(1).join("\n").trim();

  const withScopeAndBreaking =
    /^(?<type>\w+)!?\((?<scope>[^)]*)\):\s*(?<subject>.+)$/su.exec(headerLine);
  if (withScopeAndBreaking?.groups) {
    const {
      type,
      scope: scopeRaw,
      subject: subjectRaw,
    } = withScopeAndBreaking.groups;
    const breaking = headerLine.includes("!");
    const scope = scopeRaw.trim();
    const subject = subjectRaw.trim();
    const { body, footer, changeId } = parseBodyFooter(rest);
    return {
      body,
      breaking,
      footer,
      scope,
      subject,
      type,
      ...(changeId === undefined ? {} : { changeId }),
    };
  }
  const noScopeWithBreaking = /^(?<type>\w+)!?:\s*(?<subject>.+)$/su.exec(
    headerLine
  );
  if (noScopeWithBreaking?.groups) {
    const { type, subject: subjectRaw } = noScopeWithBreaking.groups;
    const breaking = headerLine.includes("!");
    const subject = subjectRaw.trim();
    const { body, footer, changeId } = parseBodyFooter(rest);
    return {
      body,
      breaking,
      footer,
      scope: "",
      subject,
      type,
      ...(changeId === undefined ? {} : { changeId }),
    };
  }
  return null;
};
