import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import {
  formatCommitMessage,
  parseCommitMessage,
} from "../src/core/commit-format.js";
import { stacking } from "../src/plugins/stacking.js";

describe("Change-Id parsing & formatting", () => {
  test("parses Change-Id from commit message footer", () => {
    const raw =
      "feat(scope): subject\n\nDetailed explanation.\n\nChange-Id: I8f9c0e2d3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d";
    const parsed = parseCommitMessage(raw);
    expect(parsed).toStrictEqual({
      body: "Detailed explanation.",
      breaking: false,
      changeId: "I8f9c0e2d3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d",
      footer: undefined,
      scope: "scope",
      subject: "subject",
      type: "feat",
    });
  });

  test("round-trips Change-Id footer correctly", () => {
    const formatted = formatCommitMessage("fix", "db", "update tables", {
      body: "Explain body.",
      changeId: "I1234567890abcdef1234567890abcdef12345678",
    });
    expect(formatted).toContain(
      "Change-Id: I1234567890abcdef1234567890abcdef12345678"
    );

    const parsed = parseCommitMessage(formatted);
    expect(parsed?.changeId).toBe("I1234567890abcdef1234567890abcdef12345678");
  });
});

describe("Stacking plugin hooks", () => {
  const plugin = stacking();

  test("prepareMessage appends new Change-Id if missing", async () => {
    const original = "feat: add user profile";
    const prepared = await plugin.hooks?.prepareMessage?.(original);

    expect(prepared).not.toBe(original);
    expect(prepared).toContain("Change-Id: I");

    const parsed = parseCommitMessage(prepared ?? "");
    expect(parsed?.changeId).toMatch(/^I[0-9a-f]{40}$/u);
  });

  test("prepareMessage preserves existing Change-Id", async () => {
    const original =
      "feat: add user profile\n\nChange-Id: I1234567890abcdef1234567890abcdef12345678";
    const prepared = await plugin.hooks?.prepareMessage?.(original);

    expect(prepared).toBe(original);
  });

  describe("validateMessage under BETTER_COMMIT_CHECK_MODE", () => {
    const checkEnv = process.env;

    beforeEach(() => {
      process.env = { ...checkEnv };
    });

    afterEach(() => {
      process.env = checkEnv;
    });

    test("passes validation if Change-Id is present", async () => {
      const message =
        "feat: profile\n\nChange-Id: I1234567890abcdef1234567890abcdef12345678";
      process.env.BETTER_COMMIT_CHECK_MODE = "1";

      const result = await plugin.hooks?.validateMessage?.(message);
      expect(result?.valid).toBe(true);
      expect(result?.errors).toHaveLength(0);
    });

    test("fails validation if Change-Id is missing in check mode", async () => {
      const message = "feat: profile without change-id";
      process.env.BETTER_COMMIT_CHECK_MODE = "1";

      const result = await plugin.hooks?.validateMessage?.(message);
      expect(result?.valid).toBe(false);
      expect(result?.errors).toContain(
        "Missing stable Change-Id footer in commit message."
      );
    });

    test("passes validation if Change-Id is missing in normal mode", async () => {
      const message = "feat: profile without change-id";
      process.env.BETTER_COMMIT_CHECK_MODE = undefined;

      const result = await plugin.hooks?.validateMessage?.(message);
      expect(result?.valid).toBe(true);
    });
  });
});
