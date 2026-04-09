import { describe, expect, test } from "bun:test";

import { mergeUserConfig as merge } from "../src/config/resolve.js";
import { aiSuggest } from "../src/plugins/ai-suggest.js";
import { conventionalCommits } from "../src/plugins/conventional-commits.js";

describe("mergeUserConfig", () => {
  test("merges conventionalCommits and aiSuggest", () => {
    const resolved = merge({
      plugins: [
        conventionalCommits({
          types: ["feat", "fix"],
        }),
        aiSuggest({ provider: "local" }),
      ],
    });
    expect(resolved.rules.types).toStrictEqual(["feat", "fix"]);
    expect(resolved.ai?.provider).toBe("local");
    expect(resolved.pluginIds).toStrictEqual([
      "conventional-commits",
      "ai-suggest",
    ]);
  });
});
