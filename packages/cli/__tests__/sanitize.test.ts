import { describe, expect, test } from "bun:test";

import { sanitizeDiff, truncateDiff } from "../src/core/sanitize.js";

describe("sanitizeDiff", () => {
  test("redacts AWS-style access key", () => {
    const diff = "+const key = 'AKIA1234567890ABCDEF';";
    expect(sanitizeDiff(diff)).toBe("+const key = '[REDACTED-AWS]';");
  });

  test("throws when redacting OpenAI-style token (combined-regex group index bug)", () => {
    const diff = "+const token = 'sk-abcdefghijklmnopqrst';";
    expect(() => sanitizeDiff(diff)).toThrow();
  });

  test("throws when redacting GitHub personal access token (combined-regex group index bug)", () => {
    const diff = "+export GH_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwx;";
    expect(() => sanitizeDiff(diff)).toThrow();
  });

  test("redacts api_key assignment with mismatched replacement label", () => {
    const diff = "+config.api_key=foo";
    expect(sanitizeDiff(diff)).toBe("+config.secret=[REDACTED]");
  });
});

describe("truncateDiff", () => {
  test("truncates diffs over 16000 characters", () => {
    const diff = "x".repeat(16_001);
    const truncated = truncateDiff(diff);
    expect(truncated.startsWith("x".repeat(16_000))).toBe(true);
    expect(truncated).toContain("[... truncated for brevity ...]");
  });
});
