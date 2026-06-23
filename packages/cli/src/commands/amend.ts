import * as p from "@clack/prompts";
import { execa } from "execa";

import { parseCommitMessage } from "../core/commit-format.js";
import { exitFailure, exitSuccess } from "../core/exit.js";
import { getCommitsInRange, hasStagedFiles, isGitRepo } from "../core/git.js";
import { detectBaseBranch } from "./stack.js";

export interface AmendOptions {
  cwd?: string;
  base?: string;
}

export const runAmend = async (
  target: string,
  options: AmendOptions
): Promise<void> => {
  const cwd = options.cwd ?? process.cwd();

  p.intro("better-commit amend");

  if (!isGitRepo(cwd)) {
    p.cancel("Not a git repository");
    exitFailure();
  }

  const staged = await hasStagedFiles(cwd);
  if (!staged) {
    p.cancel("No staged files to amend. Please stage your changes first.");
    exitFailure();
  }

  const base = options.base ?? (await detectBaseBranch(cwd));
  const commits = await getCommitsInRange(base, "HEAD", cwd);
  if (commits.length === 0) {
    p.cancel(`No commits found in stack against base ${base}`);
    exitFailure();
  }

  // Reverse commits so bottom of the stack is index 0
  // eslint-disable-next-line unicorn/no-array-reverse -- safe to reverse a cloned array
  const stack = [...commits].reverse();
  let targetItem: (typeof stack)[number] | undefined;

  // 1. Try numeric index resolution (1-based index from bottom of stack)
  const index = Number.parseInt(target, 10);
  if (!Number.isNaN(index)) {
    const stackIdx = index - 1;
    if (stackIdx >= 0 && stackIdx < stack.length) {
      targetItem = stack[stackIdx];
    }
  }

  // 2. Try Change-Id or Hash prefix resolution
  if (!targetItem) {
    const targetLower = target.toLowerCase();
    targetItem = stack.find((item) => {
      const parsed = parseCommitMessage(item.message);
      const changeId = parsed?.changeId?.toLowerCase() ?? "";
      const hash = item.hash.toLowerCase();
      return (
        changeId.startsWith(targetLower) ||
        changeId.includes(targetLower) ||
        hash.startsWith(targetLower)
      );
    });
  }

  if (!targetItem) {
    p.cancel(`Could not find commit in stack matching identifier: "${target}"`);
    exitFailure();
    return;
  }

  const title = targetItem.message.split("\n")[0] ?? "No subject";
  const confirm = await p.confirm({
    initialValue: true,
    message: `Stage changes into commit [${targetItem.hash.slice(0, 7)}] - "${title}"?`,
  });

  if (p.isCancel(confirm) || !confirm) {
    p.cancel("Amend cancelled");
    exitSuccess();
    return;
  }

  const spinner = p.spinner();
  spinner.start("Creating fixup commit...");
  try {
    await execa("git", ["commit", "--fixup", targetItem.hash], {
      cwd,
      env: { ...process.env, BETTER_COMMIT_SKIP_HOOK: "1" },
    });
  } catch (error) {
    spinner.stop("Failed");
    p.log.error(`Could not create fixup commit: ${String(error)}`);
    exitFailure();
  }
  spinner.stop("Fixup commit created");

  spinner.start("Running headless autosquash rebase...");
  try {
    await execa(
      "git",
      [
        "-c",
        "sequence.editor=true",
        "rebase",
        "-i",
        "--autosquash",
        "--empty=keep",
        base,
      ],
      { cwd }
    );
    spinner.stop("Autosquash completed");
    p.outro("Amend successful! Commit stack restacked cleanly.");
    exitSuccess();
  } catch {
    spinner.stop("Rebase conflicted");
    p.log.error("Autosquash rebase failed due to merge conflicts.");
    p.log.warn("You are now in an active git rebase state.");
    p.log.info(
      "Please resolve conflicts manually, then run: git rebase --continue"
    );
    p.log.info("Or abort the rebase: git rebase --abort");
    exitFailure();
  }
};
