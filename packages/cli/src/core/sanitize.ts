const SECRET_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  {
    pattern: /\b(?<prefix>AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}\b/gu,
    replacement: "[REDACTED-AWS]",
  },
  {
    pattern: /\bsk-ant-[a-zA-Z0-9_-]+\b/gu,
    replacement: "[REDACTED-ANTHROPIC]",
  },
  {
    pattern: /\bsk_live_[a-zA-Z0-9]+\b/gu,
    replacement: "[REDACTED-STRIPE]",
  },
  {
    pattern: /\bsk-[a-zA-Z0-9]{20,}\b/gu,
    replacement: "[REDACTED-OPENAI]",
  },
  {
    pattern: /\bghp_[a-zA-Z0-9]{36}\b/gu,
    replacement: "[REDACTED-GITHUB]",
  },
  {
    pattern: /\bgho_[a-zA-Z0-9]{36}\b/gu,
    replacement: "[REDACTED-GITHUB]",
  },
  {
    pattern: /\bBearer\s+[a-zA-Z0-9._-]+\b/giu,
    replacement: "Bearer [REDACTED]",
  },
  {
    pattern: /\/\/registry\.npmjs\.org\/:_authToken=\S+/gu,
    replacement: "//registry.npmjs.org/:_authToken=[REDACTED]",
  },
  {
    pattern:
      /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC )?PRIVATE KEY-----/gu,
    replacement: "[REDACTED-PEM]",
  },
  {
    pattern: /password\s*=\s*["']?(?!\[REDACTED)[^"'\s]+["']?/giu,
    replacement: "password=[REDACTED]",
  },
  {
    pattern: /api[_-]?key\s*=\s*["']?(?!\[REDACTED)[^"'\s]+["']?/giu,
    replacement: "api_key=[REDACTED]",
  },
  {
    pattern: /secret\s*=\s*["']?(?!\[REDACTED)[^"'\s]+["']?/giu,
    replacement: "secret=[REDACTED]",
  },
  {
    pattern: /\btoken\s*=\s*["']?(?!\[REDACTED)[^"'\s]+["']?/giu,
    replacement: "token=[REDACTED]",
  },
];

const MAX_DIFF_CHARS = 16_000;

export const truncateDiff = (diff: string): string =>
  diff.length > MAX_DIFF_CHARS
    ? `${diff.slice(0, MAX_DIFF_CHARS)}\n\n[... truncated for brevity ...]`
    : diff;

export const sanitizeDiff = (diff: string): string => {
  let result = diff;
  for (const { pattern, replacement } of SECRET_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
};
