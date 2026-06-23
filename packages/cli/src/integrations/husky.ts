import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { PREPARE_COMMIT_MSG_SCRIPT } from "./prepare-commit-msg.js";

export const installHuskyHook = (cwd: string = process.cwd()): void => {
  const huskyDir = path.join(cwd, ".husky");
  if (!existsSync(huskyDir)) {
    mkdirSync(huskyDir, { recursive: true });
  }
  const hookPath = path.join(huskyDir, "prepare-commit-msg");
  const huskyShim = path.join(huskyDir, "_", "husky.sh");
  const lines = ["#!/usr/bin/env sh"];
  if (existsSync(huskyShim)) {
    lines.push(`. "${huskyShim}"`, "");
  } else {
    lines.push("");
  }
  lines.push(PREPARE_COMMIT_MSG_SCRIPT.trimEnd());
  writeFileSync(hookPath, `${lines.join("\n")}\n`, {
    encoding: "utf-8",
    mode: 0o755,
  });
};
