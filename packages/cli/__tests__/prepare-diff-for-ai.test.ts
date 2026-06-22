import { describe, expect, test } from "bun:test";

import type { ResolvedCommitConfig } from "../src/config/types.js";
import { prepareDiffForAi } from "../src/core/prepare-diff-for-ai.js";

const SECRET_DIFF = "+const token = 'sk-abcdefghijklmnopqrst';";
const REDACTED_DIFF = "+const token = '[REDACTED-OPENAI]';";

const baseConfig: ResolvedCommitConfig = {
  pluginIds: ["ai-suggest"],
  rules: { scopes: undefined, strictScopes: false, types: [] },
};

describe("prepareDiffForAi", () => {
  test("cloud provider with allowUnsanitized still sanitizes secrets", () => {
    const result = prepareDiffForAi(SECRET_DIFF, {
      ...baseConfig,
      ai: { allowUnsanitized: true, provider: "openai" },
    });
    expect(result).toBe(REDACTED_DIFF);
  });

  test("local provider with allowUnsanitized skips sanitization", () => {
    const result = prepareDiffForAi(SECRET_DIFF, {
      ...baseConfig,
      ai: { allowUnsanitized: true, provider: "local" },
    });
    expect(result).toBe(SECRET_DIFF);
  });

  test("default local provider sanitizes secrets", () => {
    const result = prepareDiffForAi(SECRET_DIFF, {
      ...baseConfig,
      ai: { allowUnsanitized: false, provider: "local" },
    });
    expect(result).toBe(REDACTED_DIFF);
  });
});
