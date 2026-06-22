import { describe, expect, test } from "bun:test";

import {
  formatCommitMessage,
  parseCommitMessage,
} from "../src/core/commit-format.js";

describe("parseCommitMessage", () => {
  test("parses scoped commit header", () => {
    const parsed = parseCommitMessage("feat(scope): subject");
    expect(parsed).toStrictEqual({
      body: undefined,
      breaking: false,
      footer: undefined,
      scope: "scope",
      subject: "subject",
      type: "feat",
    });
  });

  test("parses breaking change without scope", () => {
    const parsed = parseCommitMessage("feat!: breaking");
    expect(parsed).toStrictEqual({
      body: undefined,
      breaking: true,
      footer: undefined,
      scope: "",
      subject: "breaking",
      type: "feat",
    });
  });

  test("returns null for invalid format", () => {
    expect(parseCommitMessage("invalid")).toBeNull();
  });
});

describe("formatCommitMessage round-trip", () => {
  test("round-trips unscoped commit with body", () => {
    const formatted = formatCommitMessage("feat", "", "add login", {
      body: "Detailed explanation.",
    });
    const parsed = parseCommitMessage(formatted);
    expect(parsed).toStrictEqual({
      body: "Detailed explanation.",
      breaking: false,
      footer: undefined,
      scope: "",
      subject: "add login",
      type: "feat",
    });
  });

  test("round-trips scoped commit", () => {
    const formatted = formatCommitMessage("fix", "api", "handle errors");
    const parsed = parseCommitMessage(formatted);
    expect(parsed).toStrictEqual({
      body: undefined,
      breaking: false,
      footer: undefined,
      scope: "api",
      subject: "handle errors",
      type: "fix",
    });
  });

  test("round-trips breaking commit with body and footer", () => {
    const formatted = formatCommitMessage("feat", "auth", "remove legacy login", {
      breaking: true,
      body: "Legacy login is no longer supported.",
      breakingChange: "Users must migrate to OAuth.",
    });
    const parsed = parseCommitMessage(formatted);
    expect(parsed).toStrictEqual({
      body: "Legacy login is no longer supported.",
      breaking: true,
      footer: "BREAKING CHANGE: Users must migrate to OAuth.",
      scope: "auth",
      subject: "remove legacy login",
      type: "feat",
    });
  });
});
