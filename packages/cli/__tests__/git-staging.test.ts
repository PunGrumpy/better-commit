import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { execa } from "execa";

import { getUnstagedFiles, stageFiles } from "../src/core/git.js";

describe("git staging utilities", () => {
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "better-commit-test-"));
    await execa("git", ["init"], { cwd: tempDir });
    await execa("git", ["config", "user.name", "Test User"], { cwd: tempDir });
    await execa("git", ["config", "user.email", "test@example.com"], {
      cwd: tempDir,
    });
  });

  afterAll(async () => {
    await rm(tempDir, { force: true, recursive: true });
  });

  test("getUnstagedFiles should list modified and untracked files", async () => {
    let unstaged = await getUnstagedFiles(tempDir);
    expect(unstaged).toEqual([]);

    const file1 = "file1.txt";
    await writeFile(path.join(tempDir, file1), "hello", "utf-8");
    unstaged = await getUnstagedFiles(tempDir);
    expect(unstaged).toContain(file1);

    await stageFiles([file1], tempDir);
    unstaged = await getUnstagedFiles(tempDir);
    expect(unstaged).not.toContain(file1);

    await execa("git", ["commit", "-m", "initial commit"], { cwd: tempDir });

    await writeFile(path.join(tempDir, file1), "hello world", "utf-8");
    unstaged = await getUnstagedFiles(tempDir);
    expect(unstaged).toContain(file1);

    const file2 = "file2.txt";
    await writeFile(path.join(tempDir, file2), "foo", "utf-8");
    unstaged = await getUnstagedFiles(tempDir);
    expect(unstaged).toContain(file1);
    expect(unstaged).toContain(file2);

    await stageFiles([file2], tempDir);
    unstaged = await getUnstagedFiles(tempDir);
    expect(unstaged).toContain(file1);
    expect(unstaged).not.toContain(file2);
  });
});
