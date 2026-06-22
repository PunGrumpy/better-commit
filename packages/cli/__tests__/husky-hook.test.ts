import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test, afterAll, beforeAll } from "bun:test";

import { installHuskyHook } from "../src/integrations/husky.js";

describe("installHuskyHook", () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), "bc-hook-test-"));
  });

  afterAll(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  test("installs husky hook", () => {
    installHuskyHook(tempDir);
    const hookPath = join(tempDir, ".husky/prepare-commit-msg");
    expect(existsSync(hookPath)).toBe(true);
    const content = readFileSync(hookPath, "utf-8");
    expect(content).toContain("exec bc commit");
  });
});
