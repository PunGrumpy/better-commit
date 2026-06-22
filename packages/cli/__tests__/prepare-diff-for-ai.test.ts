import { describe, expect, test } from "bun:test";

import type { ResolvedCommitConfig } from "../src/config/types.js";
import { prepareDiffForAi } from "../src/core/prepare-diff-for-ai.js";

const SECRET_DIFF = "+const token = 'sk-abcdefghijklmnopqrst';";

const baseConfig = (
  ai: NonNullable<ResolvedCommitConfig["ai"]>
): ResolvedCommitConfig => ({
  ai,
  pluginIds: ["ai-suggest"],
  rules: {
    scopes: undefined,
    strictScopes: false,
    types: [],
  },
});

describe("prepareDiffForAi", () => {
  test("cloud provider with allowUnsanitized still sanitizes secrets", () => {
    const config = baseConfig({
      allowUnsanitized: true,
      provider: "openai",
    });
    const result = prepareDiffForAi(SECRET_DIFF, config);
    expect(result).toContain("[REDACTED");
    expect(result).not.toContain("sk-abcdefghijklmnopqrst");
  });

  test("local provider with allowUnsanitized skips sanitization", () => {
    const config = baseConfig({
      allowUnsanitized: true,
      provider: "local",
    });
    const result = prepareDiffForAi(SECRET_DIFF, config);
    expect(result).toBe(SECRET_DIFF);
  });

  test("default local provider sanitizes secrets", () => {
    const config = baseConfig({
      allowUnsanitized: false,
      provider: "local",
    });
    const result = prepareDiffForAi(SECRET_DIFF, config);
    expect(result).toContain("[REDACTED");
    expect(result).not.toContain("sk-abcdefghijklmnopqrst");
  });
});
