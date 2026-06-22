import { describe, expect, test } from "bun:test";

import { assertNonEmptyAiOutput } from "../src/ai/assert-output.js";

describe("assertNonEmptyAiOutput", () => {
  test("returns trimmed text for non-empty input", () => {
    expect(assertNonEmptyAiOutput("  feat: add tests  ", "Test provider")).toBe(
      "feat: add tests"
    );
  });

  test("throws when text is empty", () => {
    expect(() => assertNonEmptyAiOutput("", "OpenAI")).toThrow(
      "OpenAI returned empty message"
    );
  });

  test("throws when text is whitespace only", () => {
    expect(() => assertNonEmptyAiOutput("   \n\t", "Anthropic")).toThrow(
      "Anthropic returned empty message"
    );
  });
});
