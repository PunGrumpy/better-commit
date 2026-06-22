import { describe, expect, test } from "bun:test";

import type { ResolvedCommitConfig } from "../src/config/types.js";
import { validateCommitMessage } from "../src/core/validate-commit.js";

const baseConfig: ResolvedCommitConfig = {
  pluginIds: ["conventional-commits"],
  rules: { scopes: undefined, strictScopes: false, types: ["feat", "fix"] },
};

describe("validateCommitMessage", () => {
  test("accepts valid conventional commit", async () => {
    const result = await validateCommitMessage("feat: add login", baseConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toStrictEqual([]);
  });

  test("rejects empty message", async () => {
    const result = await validateCommitMessage("", baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Commit message is empty");
  });

  test("rejects invalid format", async () => {
    const result = await validateCommitMessage("not a commit", baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Invalid format");
  });

  test("rejects disallowed type", async () => {
    const result = await validateCommitMessage("wip: stuff", baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Type "wip" not in allowed list');
  });

  test("rejects scope not in allowed list when strictScopes is true", async () => {
    const config: ResolvedCommitConfig = {
      ...baseConfig,
      rules: {
        scopes: ["api"],
        strictScopes: true,
        types: ["feat", "fix"],
      },
    };
    const result = await validateCommitMessage("feat(web): x", config);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Scope "web" not in allowed list');
  });

  test("warns when subject exceeds 72 characters", async () => {
    const longSubject = "a".repeat(73);
    const result = await validateCommitMessage(`feat: ${longSubject}`, baseConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toStrictEqual([]);
    expect(result.warnings[0]).toContain("Subject exceeds 72 characters");
  });

  test("warns when subject ends with a period", async () => {
    const result = await validateCommitMessage("feat: add login.", baseConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toStrictEqual([]);
    expect(result.warnings).toContain("Subject should not end with a period");
  });
});
