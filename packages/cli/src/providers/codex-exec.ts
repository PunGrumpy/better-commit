import { spawn } from "node:child_process";

import { buildCommitPrompt } from "../prompts/commit-prompt.js";
import type { AIProvider, GenerateMessageContext } from "./types.js";

const TIMEOUT_MS = 30_000;

const runCodexProcess = (prompt: string): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const proc = spawn("codex", ["exec", prompt], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });

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
      reject(new Error("Codex exec timeout (30s)"));
    }, TIMEOUT_MS);

    proc.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(stderr || `codex exec exited with code ${code}`));
        return;
      }
      const text = stdout.trim();
      resolve(text || "feat: update");
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });

export const codexExecProvider: AIProvider = {
  generateMessage(diff: string, context: GenerateMessageContext) {
    const prompt = buildCommitPrompt(diff, context, context.customPrompt);
    return runCodexProcess(prompt);
  },
  name: "codex-exec",
};
