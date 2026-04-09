import { describe, expect, test } from "bun:test";

import { aiSuggest } from "../src/plugins/ai-suggest.js";
import { conventionalCommits } from "../src/plugins/conventional-commits.js";
import { mergeUserConfig } from "../src/config/resolve.js";

describe("mergeUserConfig", () => {
  test("merges conventionalCommits and aiSuggest", () => {
    const resolved = mergeUserConfig({
      plugins: [
        conventionalCommits({
          types: ["feat", "fix"],
        }),
        aiSuggest({ provider: "local" }),
      ],
    });
    expect(resolved.rules.types).toEqual(["feat", "fix"]);
    expect(resolved.ai?.provider).toBe("local");
    expect(resolved.pluginIds).toEqual(["conventional-commits", "ai-suggest"]);
  });
});
