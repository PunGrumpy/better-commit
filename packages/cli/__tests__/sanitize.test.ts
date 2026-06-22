import { describe, expect, test } from "bun:test";

import { sanitizeDiff, truncateDiff } from "../src/core/sanitize.js";

describe("sanitizeDiff", () => {
  test("redacts AWS-style access key", () => {
    const diff = "+const key = 'AKIA1234567890ABCDEF';";
    expect(sanitizeDiff(diff)).toBe("+const key = '[REDACTED-AWS]';");
  });

  test("redacts OpenAI-style token", () => {
    const diff = "+const token = 'sk-abcdefghijklmnopqrst';";
    expect(sanitizeDiff(diff)).toBe("+const token = '[REDACTED-OPENAI]';");
  });

  test("redacts GitHub personal access token", () => {
    const diff = "+export GH_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz;";
    expect(sanitizeDiff(diff)).toBe("+export GH_TOKEN=[REDACTED-GITHUB];");
  });

  test("redacts api_key assignment", () => {
    const diff = "+config.api_key=foo";
    expect(sanitizeDiff(diff)).toBe("+config.api_key=[REDACTED]");
  });

  test("redacts Anthropic API key", () => {
    const diff = "+ANTHROPIC_API_KEY=sk-ant-api03-abc123XYZ";
    expect(sanitizeDiff(diff)).toBe("+ANTHROPIC_API_KEY=[REDACTED-ANTHROPIC]");
  });

  test("redacts Stripe live secret key", () => {
    const diff = "+STRIPE_KEY=sk_live_abc123def456";
    expect(sanitizeDiff(diff)).toBe("+STRIPE_KEY=[REDACTED-STRIPE]");
  });

  test("redacts npm registry auth token in .npmrc", () => {
    const diff =
      "+//registry.npmjs.org/:_authToken=npm_abcdefghijklmnopqrstuvwxyz";
    expect(sanitizeDiff(diff)).toBe(
      "+//registry.npmjs.org/:_authToken=[REDACTED]"
    );
  });

  test("redacts PEM private key block", () => {
    const diff = `+-----BEGIN RSA PRIVATE KEY-----
+MIIEpAIBAAKCAQEA1234
+-----END RSA PRIVATE KEY-----`;
    expect(sanitizeDiff(diff)).toBe("+[REDACTED-PEM]");
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
