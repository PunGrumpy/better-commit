import { describe, expect, test, afterAll, beforeAll } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { installHuskyHook } from "../src/integrations/husky.js";

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

  test("installs husky hook", () => {
    installHuskyHook(tempDir);
    const hookPath = path.join(tempDir, ".husky/prepare-commit-msg");
    expect(existsSync(hookPath)).toBe(true);
    const content = readFileSync(hookPath, "utf-8");
    expect(content).toContain("exec bc commit");
  });
});
