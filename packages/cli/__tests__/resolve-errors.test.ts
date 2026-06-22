import { describe, expect, test } from "bun:test";

import { DuplicatePluginError } from "../src/config/duplicate-plugin-error.js";
import { MissingConventionalPluginError } from "../src/config/missing-conventional-plugin-error.js";
import { mergeUserConfig } from "../src/config/resolve.js";
import { aiSuggest } from "../src/plugins/ai-suggest.js";
import { conventionalCommits } from "../src/plugins/conventional-commits.js";

describe("mergeUserConfig errors", () => {
  test("throws DuplicatePluginError for duplicate plugin id", () => {
    expect(() =>
      mergeUserConfig({
        plugins: [
          conventionalCommits({ types: ["feat"] }),
          conventionalCommits({ types: ["feat"] }),
        ],
      })
    ).toThrow(DuplicatePluginError);
  });

  test("throws MissingConventionalPluginError when conventionalCommits is absent", () => {
    expect(() =>
      mergeUserConfig({
        plugins: [aiSuggest({ provider: "local" })],
      })
    ).toThrow(MissingConventionalPluginError);
  });

  test("throws when conventionalCommits types array is empty", () => {
    expect(() =>
      mergeUserConfig({
        plugins: [conventionalCommits({ types: [] })],
      })
    ).toThrow("conventionalCommits() must specify a non-empty types array.");
  });
});
