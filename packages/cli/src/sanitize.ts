const SECRET_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  {
    pattern: /\b(AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}\b/g,
    replacement: "[REDACTED-AWS]",
  },
  { pattern: /\bsk-[a-zA-Z0-9]{20,}\b/g, replacement: "[REDACTED-OPENAI]" },
  { pattern: /\bghp_[a-zA-Z0-9]{36}\b/g, replacement: "[REDACTED-GITHUB]" },
  { pattern: /\bgho_[a-zA-Z0-9]{36}\b/g, replacement: "[REDACTED-GITHUB]" },
  {
    pattern: /\bBearer\s+[a-zA-Z0-9._-]+\b/gi,
    replacement: "Bearer [REDACTED]",
  },
  {
    pattern: /password\s*=\s*["']?[^"'\s]+["']?/gi,
    replacement: "password=[REDACTED]",
  },
  {
    pattern: /api[_-]?key\s*=\s*["']?[^"'\s]+["']?/gi,
    replacement: "api_key=[REDACTED]",
  },
  {
    pattern: /secret\s*=\s*["']?[^"'\s]+["']?/gi,
    replacement: "secret=[REDACTED]",
  },
  {
    pattern: /token\s*=\s*["']?[^"'\s]+["']?/gi,
    replacement: "token=[REDACTED]",
  },
];

const COMBINED_SECRETS = new RegExp(
  SECRET_PATTERNS.map((p) => `(${p.pattern.source})`).join("|"),
  "gi"
);

/** ~4K tokens */
const MAX_DIFF_CHARS = 16_000;

export const truncateDiff = (diff: string): string =>
  diff.length > MAX_DIFF_CHARS
    ? `${diff.slice(0, MAX_DIFF_CHARS)}\n\n[... truncated for brevity ...]`
    : diff;

export const sanitizeDiff = (diff: string): string =>
  diff.replace(COMBINED_SECRETS, (match, ...groups: (string | undefined)[]) => {
    const idx = groups.findIndex((g) => g !== undefined);
    return idx === -1 ? match : SECRET_PATTERNS[idx].replacement;
  });
