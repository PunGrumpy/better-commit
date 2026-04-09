import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { execa } from "execa";

const git = (args: string[], cwd: string) =>
  execa("git", args, { cwd, reject: false });

export const isGitRepo = (cwd: string = process.cwd()): boolean => {
  const gitDir = join(cwd, ".git");
  return existsSync(gitDir);
};

export const hasStagedFiles = async (
  cwd: string = process.cwd()
): Promise<boolean> => {
  const { exitCode } = await git(["diff", "--cached", "--quiet"], cwd);
  return exitCode === 1;
};

export const getStagedDiff = async (
  cwd: string = process.cwd()
): Promise<string> => {
  const { stdout } = await git(["diff", "--cached"], cwd);
  return stdout;
};

export const stageAll = async (cwd: string = process.cwd()): Promise<void> => {
  await git(["add", "-A"], cwd);
};

export const commit = async (
  message: string,
  cwd: string = process.cwd()
): Promise<void> => {
  await execa("git", ["commit", "-m", message], { cwd });
};

export const getLastCommitMessage = async (
  cwd: string = process.cwd()
): Promise<string> => {
  const { stdout } = await git(["log", "-1", "--pretty=%B"], cwd);
  return stdout;
};

export const getLastCommitDiff = async (
  cwd: string = process.cwd()
): Promise<string> => {
  const { stdout } = await git(["show", "HEAD", "--no-color"], cwd);
  return stdout;
};

export const getCommitEditMessage = (cwd: string = process.cwd()): string => {
  const path = join(cwd, ".git", "COMMIT_EDITMSG");
  if (!existsSync(path)) {
    return "";
  }
  return readFileSync(path, "utf8");
};

export interface CommitInRange {
  hash: string;
  message: string;
}

export const getCommitsInRange = async (
  from: string,
  to: string,
  cwd: string = process.cwd()
): Promise<CommitInRange[]> => {
  const { stdout } = await git(
    ["log", "--pretty=format:%h%n%B%n---BC---", `${from}..${to}`],
    cwd
  );
  const entries: CommitInRange[] = [];
  const blocks = stdout.split("\n---BC---\n").filter(Boolean);
  for (const block of blocks) {
    const [first, ...rest] = block.split("\n");
    const hash = first ?? "";
    const message = rest.join("\n").trim();
    if (hash && message) {
      entries.push({ hash, message });
    }
  }
  return entries;
};

export const commitAmend = async (
  message: string,
  cwd: string = process.cwd()
): Promise<void> => {
  await execa("git", ["commit", "--amend", "-m", message], { cwd });
};
