import { describe, expect, test, afterAll, beforeAll } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { writeHookCommitMessage } from "../src/core/git.js";

describe("writeHookCommitMessage", () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = mkdtempSync(path.join(tmpdir(), "bc-hook-msg-test-"));
  });

  afterAll(() => {
    try {
      rmSync(tempDir, { force: true, recursive: true });
    } catch {
      // ignore
    }
  });

  test("writes message with trailing newline", () => {
    const filePath = path.join(tempDir, "COMMIT_EDITMSG");
    writeHookCommitMessage(filePath, "feat: add login");
    expect(existsSync(filePath)).toBe(true);
    expect(readFileSync(filePath, "utf-8")).toBe("feat: add login\n");
  });

  test("preserves multiline body", () => {
    const filePath = path.join(tempDir, "COMMIT_EDITMSG-multiline");
    const message = "feat: add login\n\nDetailed body line.";
    writeHookCommitMessage(filePath, message);
    expect(readFileSync(filePath, "utf-8")).toBe(`${message}\n`);
  });
});
