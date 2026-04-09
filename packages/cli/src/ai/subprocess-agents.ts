import { spawn } from "node:child_process";
import { once } from "node:events";
import { createReadStream, existsSync, rmSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";

import {
  buildCommitPrompt,
  getShortPromptHint,
} from "../prompts/commit-prompt.js";
import type { AIProvider, GenerateMessageContext } from "./types.js";

const CODEX_TIMEOUT_MS = 30_000;

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
    }, CODEX_TIMEOUT_MS);

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

const CLAUDE_TIMEOUT_MS = 30_000;
const CLAUDE_ARG_THRESHOLD = 32_000;

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
    }, CLAUDE_TIMEOUT_MS);

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

    const useStdin = prompt.length > CLAUDE_ARG_THRESHOLD;
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

const AGENT_PATHS = ["agent", join(homedir(), ".local", "bin", "agent")];

let cachedAgentCommand: string | null = null;

const findAgentCommand = (): string => {
  if (cachedAgentCommand !== null) {
    return cachedAgentCommand;
  }
  for (const path of AGENT_PATHS) {
    if (path === "agent") {
      cachedAgentCommand = "agent";
      return "agent";
    }
    if (existsSync(path)) {
      cachedAgentCommand = path;
      return path;
    }
  }
  cachedAgentCommand = "agent";
  return "agent";
};

const CURSOR_TIMEOUT_MS = 30_000;
const TIMING_ENV = "BETTER_COMMIT_DEBUG";

const logTiming = (method: string, ms: number) => {
  if (process.env[TIMING_ENV]) {
    process.stderr.write(`[cursor-acp] ${method}: ${ms}ms\n`);
  }
};

export const cursorAcpProvider: AIProvider = {
  generateMessage(diff: string, context: GenerateMessageContext) {
    const prompt = buildCommitPrompt(diff, context, context.customPrompt);

    const agentCmd = findAgentCommand();
    const proc = spawn(agentCmd, ["acp"], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });

    let nextId = 1;
    const pending = new Map<
      number,
      { resolve: (v: unknown) => void; reject: (e: Error) => void }
    >();
    let collectedText = "";

    const send = (method: string, params?: object) => {
      const start = performance.now();
      return new Promise<unknown>((resolve, reject) => {
        const id = nextId;
        nextId += 1;
        pending.set(id, {
          reject: (e) => {
            logTiming(method, Math.round(performance.now() - start));
            reject(e);
          },
          resolve: (v) => {
            logTiming(method, Math.round(performance.now() - start));
            resolve(v);
          },
        });
        proc.stdin?.write(
          `${JSON.stringify({ id, jsonrpc: "2.0", method, params: params ?? {} })}\n`
        );
      });
    };

    const respond = (id: number, result: object) => {
      proc.stdin?.write(`${JSON.stringify({ id, jsonrpc: "2.0", result })}\n`);
    };

    const timeout = setTimeout(() => {
      proc.kill("SIGTERM");
      for (const { reject } of pending.values()) {
        reject(new Error("Cursor ACP timeout (30s)"));
      }
      pending.clear();
    }, CURSOR_TIMEOUT_MS);

    const { stdout } = proc;
    if (!stdout) {
      throw new Error("agent acp stdout is null");
    }
    let settled = false;
    return new Promise<string>((resolve, reject) => {
      const rl = createInterface({ input: stdout });
      rl.on("line", (line) => {
        try {
          const msg = JSON.parse(line) as {
            id?: number;
            result?: unknown;
            error?: { message: string };
            method?: string;
            params?: {
              update?: { sessionUpdate?: string; content?: { text?: string } };
            };
          };

          const { id } = msg;
          const hasId = id !== undefined && id !== null;
          const hasResult = msg.result !== undefined && msg.result !== null;
          const hasError = msg.error !== undefined && msg.error !== null;
          if (hasId && (hasResult || hasError)) {
            const waiter = pending.get(id);
            if (waiter) {
              pending.delete(id);
              if (msg.error) {
                waiter.reject(new Error(msg.error.message));
              } else {
                waiter.resolve(msg.result);
              }
            }
            return;
          }

          if (msg.method === "session/update") {
            const update = msg.params?.update;
            if (
              update?.sessionUpdate === "agent_message_chunk" &&
              update.content?.text
            ) {
              collectedText += update.content.text;
            }
            return;
          }

          if (
            msg.method === "session/request_permission" &&
            msg.id !== undefined &&
            msg.id !== null
          ) {
            respond(msg.id, {
              outcome: { optionId: "allow-once", outcome: "selected" },
            });
          }
        } catch {
          // ignore parse errors
        }
      });

      proc.stderr?.on("data", () => {
        // ignore stderr
      });

      proc.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      proc.on("exit", (code) => {
        clearTimeout(timeout);
        if (code !== 0 && code !== null && collectedText === "") {
          reject(new Error(`agent acp exited with code ${code}`));
        }
      });

      (async () => {
        try {
          await send("initialize", {
            clientCapabilities: {
              fs: { readTextFile: false, writeTextFile: false },
              terminal: false,
            },
            clientInfo: { name: "better-commit", version: "0.0.0" },
            protocolVersion: 1,
          });
          await send("authenticate", { methodId: "cursor_login" });
          const { sessionId } = (await send("session/new", {
            cwd: process.cwd(),
            mcpServers: [],
          })) as { sessionId: string };
          await send("session/prompt", {
            prompt: [{ text: prompt, type: "text" }],
            sessionId,
          });
          clearTimeout(timeout);
          proc.stdin?.end();
          await once(proc, "close");
          const trimmed = collectedText.trim();
          if (!settled) {
            settled = true;
            resolve(trimmed || "feat: update");
          }
        } catch (error) {
          clearTimeout(timeout);
          proc.kill("SIGTERM");
          if (!settled) {
            settled = true;
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        }
      })();
    });
  },
  name: "cursor-acp",
};
