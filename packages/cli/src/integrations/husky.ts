import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HUSKY_HOOK = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

bc commit
`;

export const installHuskyHook = (cwd: string = process.cwd()): void => {
  const huskyDir = join(cwd, ".husky");
  if (!existsSync(huskyDir)) {
    mkdirSync(huskyDir, { recursive: true });
  }
  const hookPath = join(huskyDir, "prepare-commit-msg");
  writeFileSync(hookPath, HUSKY_HOOK, "utf-8");
};
