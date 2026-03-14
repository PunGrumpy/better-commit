import { spawn } from "node:child_process";
import { createReadStream, rmSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildCommitPrompt,
  getShortPromptHint,
} from "../prompts/commit-prompt.js";
import type { AIProvider, GenerateMessageContext } from "./types.js";

const TIMEOUT_MS = 30_000;
const ARG_THRESHOLD = 32_000;

const runClaudeProcess = (
  args: string[],
  useStdin: boolean,
  tmpDir: string | null
): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const proc = spawn("claude", args, {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });

    if (useStdin && tmpDir) {
      const tmpPath = join(tmpDir, "prompt.txt");
      const { stdin } = proc;
      if (stdin) {
        createReadStream(tmpPath).pipe(stdin);
      }
      proc.on("close", () => {
        rmSync(tmpDir, { force: true, recursive: true });
      });
    }

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    const timeout = setTimeout(() => {
      proc.kill("SIGTERM");
      reject(new Error("Claude CLI timeout (30s)"));
    }, TIMEOUT_MS);

    let settled = false;
    const settle = (fn: () => void) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        fn();
      }
    };

    proc.on("close", (code) => {
      if (code !== 0) {
        settle(() =>
          reject(new Error(stderr || `claude exited with code ${code}`))
        );
        return;
      }
      try {
        const json = JSON.parse(stdout) as { result?: string };
        const text = json.result?.trim();
        settle(() => resolve(text || "feat: update"));
      } catch {
        settle(() => reject(new Error("Failed to parse Claude CLI output")));
      }
    });

    proc.on("error", (err) => {
      settle(() => reject(err));
    });
  });

export const claudeCliProvider: AIProvider = {
  async generateMessage(diff: string, context: GenerateMessageContext) {
    const prompt = buildCommitPrompt(diff, context, context.customPrompt);

    const useStdin = prompt.length > ARG_THRESHOLD;
    let tmpDir: string | null = null;

    const args = ["-p"];
    if (useStdin) {
      tmpDir = await mkdtemp(join(tmpdir(), "better-commit-"));
      const tmpPath = join(tmpDir, "prompt.txt");
      await writeFile(tmpPath, prompt, "utf8");
      args.push(getShortPromptHint());
    } else {
      args.push(prompt);
    }
    args.push("--output-format", "json");

    return runClaudeProcess(args, useStdin, tmpDir);
  },
  name: "claude-cli",
};
