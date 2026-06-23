import * as p from "@clack/prompts";
import { execa } from "execa";

import { parseCommitMessage } from "../core/commit-format.js";
import { exitFailure, exitSuccess } from "../core/exit.js";
import { getCommitsInRange, isGitRepo } from "../core/git.js";

export interface StackOptions {
  cwd?: string;
  base?: string;
}

export const detectBaseBranch = async (cwd: string): Promise<string> => {
  const checkBranch = async (ref: string): Promise<boolean> => {
    try {
      const { exitCode } = await execa("git", ["rev-parse", "--verify", ref], {
        cwd,
        reject: false,
      });
      return exitCode === 0;
    } catch {
      return false;
    }
  };

  try {
    const { stdout } = await execa(
      "git",
      ["rev-parse", "--abbrev-ref", "@{u}"],
      { cwd, reject: false }
    );
    if (stdout.trim() && !stdout.includes("@{u}")) {
      return stdout.trim();
    }
  } catch {
    // Ignore and proceed
  }

  const fallbacks = ["origin/main", "origin/master", "main", "master"];
  for (const ref of fallbacks) {
    // eslint-disable-next-line no-await-in-loop -- sequential fallback detection requires loop await
    if (await checkBranch(ref)) {
      return ref;
    }
  }

  return "origin/main";
};

export const runStack = async (options: StackOptions): Promise<void> => {
  const cwd = options.cwd ?? process.cwd();

  p.intro("better-commit stack");

  if (!isGitRepo(cwd)) {
    p.cancel("Not a git repository");
    exitFailure();
  }

  const base = options.base ?? (await detectBaseBranch(cwd));
  p.log.info(`Comparing stack against base branch: ${base}`);

  const commits = await getCommitsInRange(base, "HEAD", cwd);
  if (commits.length === 0) {
    p.outro(`No commits in stack. Branch is up-to-date with ${base}.`);
    exitSuccess();
  }

  // Reverse commits so bottom of the stack is index 0
  // eslint-disable-next-line unicorn/no-array-reverse -- safe to reverse a cloned array
  const stack = [...commits].reverse();

  p.log.message("Stack (bottom to top):");
  for (let i = 0; i < stack.length; i += 1) {
    const item = stack[i];
    if (!item) {
      continue;
    }
    const { hash, message } = item;
    const isHead = i === stack.length - 1;
    const parsed = parseCommitMessage(message);

    const title = message.split("\n")[0] ?? "No subject";
    const changeIdStr = parsed?.changeId
      ? ` [Change-Id: ${parsed.changeId}]`
      : " [No Change-Id]";
    const headMarker = isHead ? " (HEAD)" : "";
    const index = i + 1;

    p.log.step(`[${index}]${headMarker} ${hash} - ${title}${changeIdStr}`);
  }

  p.outro(`Listed ${stack.length} commits.`);
  exitSuccess();
};
