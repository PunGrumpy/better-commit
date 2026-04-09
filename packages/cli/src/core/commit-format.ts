export interface ParsedCommitMessage {
  type: string;
  scope: string;
  subject: string;
  breaking?: boolean;
  body?: string;
  footer?: string;
}

export const formatCommitMessage = (
  type: string,
  scope: string,
  subject: string,
  options?: { breaking?: boolean; body?: string; breakingChange?: string }
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
  return msg;
};

const parseBodyFooter = (rest: string): { body?: string; footer?: string } => {
  if (!rest) {
    return {};
  }
  const breakingMatch = rest.match(/\n*BREAKING CHANGE:\s*(.+)$/s);
  if (breakingMatch) {
    const footer = `BREAKING CHANGE: ${breakingMatch[1].trim()}`;
    const beforeBreaking = rest
      .replace(/\n*BREAKING CHANGE:\s*.+$/s, "")
      .trim();
    return {
      body: beforeBreaking || undefined,
      footer,
    };
  }
  return { body: rest || undefined };
};

/** Parses "type(scope): subject" or "type: subject" into components. */
export const parseCommitMessage = (
  message: string
): ParsedCommitMessage | null => {
  const trimmed = message.trim();
  const lines = trimmed.split("\n");
  const headerLine = lines[0] ?? "";
  const rest = lines.slice(1).join("\n").trim();

  const withScopeAndBreaking = /^(\w+)!?\(([^)]*)\):\s*(.+)$/s.exec(headerLine);
  if (withScopeAndBreaking) {
    const [, type, scopeRaw, subjectRaw] = withScopeAndBreaking;
    const breaking = headerLine.includes("!");
    const scope = scopeRaw.trim();
    const subject = subjectRaw.trim();
    const { body, footer } = parseBodyFooter(rest);
    return { body, breaking, footer, scope, subject, type };
  }
  const noScopeWithBreaking = /^(\w+)!?:\s*(.+)$/s.exec(headerLine);
  if (noScopeWithBreaking) {
    const [, type, subjectRaw] = noScopeWithBreaking;
    const breaking = headerLine.includes("!");
    const subject = subjectRaw.trim();
    const { body, footer } = parseBodyFooter(rest);
    return { body, breaking, footer, scope: "", subject, type };
  }
  return null;
};
