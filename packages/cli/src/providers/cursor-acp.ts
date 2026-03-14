import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";

import { buildCommitPrompt } from "../prompts/commit-prompt.js";
import type { AIProvider, GenerateMessageContext } from "./types.js";

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

const TIMEOUT_MS = 30_000;
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
    }, TIMEOUT_MS);

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
