import { describe, expect, test, afterAll, beforeAll } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { installHuskyHook } from "../src/integrations/husky.js";
import { PREPARE_COMMIT_MSG_SCRIPT } from "../src/integrations/prepare-commit-msg.js";

describe("installHuskyHook", () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = mkdtempSync(path.join(tmpdir(), "bc-hook-test-"));
  });

  afterAll(() => {
    try {
      rmSync(tempDir, { force: true, recursive: true });
    } catch {
      // ignore
    }
  });

  test("installs husky hook with hook mode script", () => {
    installHuskyHook(tempDir);
    const hookPath = path.join(tempDir, ".husky/prepare-commit-msg");
    expect(existsSync(hookPath)).toBe(true);
    const content = readFileSync(hookPath, "utf-8");
    expect(content).toContain("BETTER_COMMIT_SKIP_HOOK");
    expect(content).toContain("GIT_EDITOR=cat");
    expect(content).toContain("bc commit --hook");
    expect(content).toContain("exec 0</dev/tty");
  });

  test("prepare-commit-msg script skips merge and squash", () => {
    expect(PREPARE_COMMIT_MSG_SCRIPT).toContain('"merge"');
    expect(PREPARE_COMMIT_MSG_SCRIPT).toContain('"squash"');
  });
});
