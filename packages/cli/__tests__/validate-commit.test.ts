import { describe, expect, test } from "bun:test";

import type { ResolvedCommitConfig } from "../src/config/types.js";
import { validateCommitMessage } from "../src/core/validate-commit.js";

const baseConfig: ResolvedCommitConfig = {
  pluginIds: ["conventional-commits"],
  rules: { scopes: undefined, strictScopes: false, types: ["feat", "fix"] },
};

describe("validateCommitMessage", () => {
  test("accepts valid conventional commit", () => {
    const result = validateCommitMessage("feat: add login", baseConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toStrictEqual([]);
  });

  test("rejects empty message", () => {
    const result = validateCommitMessage("", baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Commit message is empty");
  });

  test("rejects invalid format", () => {
    const result = validateCommitMessage("not a commit", baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Invalid format");
  });

  test("rejects disallowed type", () => {
    const result = validateCommitMessage("wip: stuff", baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Type "wip" not in allowed list');
  });

  test("rejects scope not in allowed list when strictScopes is true", () => {
    const config: ResolvedCommitConfig = {
      ...baseConfig,
      rules: {
        scopes: ["api"],
        strictScopes: true,
        types: ["feat", "fix"],
      },
    };
    const result = validateCommitMessage("feat(web): x", config);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Scope "web" not in allowed list');
  });

  test("warns when subject exceeds 72 characters", () => {
    const longSubject = "a".repeat(73);
    const result = validateCommitMessage(`feat: ${longSubject}`, baseConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toStrictEqual([]);
    expect(result.warnings[0]).toContain("Subject exceeds 72 characters");
  });

  test("warns when subject ends with a period", () => {
    const result = validateCommitMessage("feat: add login.", baseConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toStrictEqual([]);
    expect(result.warnings).toContain("Subject should not end with a period");
  });
});
