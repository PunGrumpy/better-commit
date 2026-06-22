import { describe, expect, test } from "bun:test";

import type { ResolvedCommitConfig } from "../src/config/types.js";
import { validateMessageForCommit } from "../src/core/ensure-valid-message.js";

const baseConfig: ResolvedCommitConfig = {
  pluginIds: ["conventional-commits"],
  rules: { scopes: undefined, strictScopes: false, types: ["feat", "fix"] },
};

describe("validateMessageForCommit", () => {
  test("returns valid result for valid message", () => {
    const result = validateMessageForCommit("feat: add login", baseConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toStrictEqual([]);
  });

  test("returns type error for invalid type", () => {
    const result = validateMessageForCommit("wip: stuff", baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Type "wip" not in allowed list');
  });
});
