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

interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  reject: (reason?: unknown) => void;
  resolve: (value: T | PromiseLike<T>) => void;
}

const promiseWithResolvers = <T>(): PromiseWithResolvers<T> =>
  (
    Promise as unknown as {
      withResolvers<R>(): PromiseWithResolvers<R>;
    }
  ).withResolvers<T>();

const CODEX_TIMEOUT_MS = 30_000;

const runCodexProcess = async (prompt: string): Promise<string> => {
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

  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    proc.kill("SIGTERM");
  }, CODEX_TIMEOUT_MS);

  try {
    const [code] = await Promise.race([
      once(proc, "close"),
      once(proc, "error").then(([err]) => {
        throw err instanceof Error ? err : new Error(String(err));
      }),
    ]);

    if (timedOut) {
      throw new Error("Codex exec timeout (30s)");
    }
    if (code !== 0) {
      throw new Error(stderr || `codex exec exited with code ${code}`);
    }
    return stdout.trim() || "feat: update";
  } finally {
    clearTimeout(timeoutId);
  }
};

export const codexExecProvider: AIProvider = {
  generateMessage(diff: string, context: GenerateMessageContext) {
    const prompt = buildCommitPrompt(diff, context, context.customPrompt);
    return runCodexProcess(prompt);
  },
  name: "codex-exec",
};

const CLAUDE_TIMEOUT_MS = 30_000;
const CLAUDE_ARG_THRESHOLD = 32_000;

const runClaudeProcess = async (
  args: string[],
  useStdin: boolean,
  tmpDir: string | null
): Promise<string> => {
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

  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    proc.kill("SIGTERM");
  }, CLAUDE_TIMEOUT_MS);

  try {
    const [code] = await Promise.race([
      once(proc, "close"),
      once(proc, "error").then(([err]) => {
        throw err instanceof Error ? err : new Error(String(err));
      }),
    ]);

    if (timedOut) {
      throw new Error("Claude CLI timeout (30s)");
    }
    if (code !== 0) {
      throw new Error(stderr || `claude exited with code ${code}`);
    }
    try {
      const json = JSON.parse(stdout) as { result?: string };
      const text = json.result?.trim();
      return text || "feat: update";
    } catch {
      throw new Error("Failed to parse Claude CLI output");
    }
  } finally {
    clearTimeout(timeoutId);
  }
};

export const claudeCliProvider: AIProvider = {
  async generateMessage(diff: string, context: GenerateMessageContext) {
    const prompt = buildCommitPrompt(diff, context, context.customPrompt);

    const useStdin = prompt.length > CLAUDE_ARG_THRESHOLD;
    let tmpDir: string | null = null;

    const args = ["-p"];
    if (useStdin) {
      tmpDir = await mkdtemp(join(tmpdir(), "better-commit-"));
      const tmpPath = join(tmpDir, "prompt.txt");
      await writeFile(tmpPath, prompt, "utf-8");
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

const runCursorAcp = async (prompt: string): Promise<string> => {
  const agentCmd = findAgentCommand();
  const proc = spawn(agentCmd, ["acp"], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "pipe"],
  });

  let nextId = 1;
  const pending = new Map<
    number,
    { reject: (e: Error) => void; resolve: (v: unknown) => void }
  >();
  let collectedText = "";

  const send = (method: string, params?: object) => {
    const start = performance.now();
    const id = nextId;
    nextId += 1;
    const { promise, resolve, reject } = promiseWithResolvers<unknown>();
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
    return promise;
  };

  const respond = (id: number, result: object) => {
    proc.stdin?.write(`${JSON.stringify({ id, jsonrpc: "2.0", result })}\n`);
  };

  const timeoutId = setTimeout(() => {
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

  const rl = createInterface({ input: stdout });

  const fatal = promiseWithResolvers<never>();
  let fatalSettled = false;
  const fail = (err: Error) => {
    if (!fatalSettled) {
      fatalSettled = true;
      fatal.reject(err);
    }
  };

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
    clearTimeout(timeoutId);
    fail(err instanceof Error ? err : new Error(String(err)));
  });

  proc.on("exit", (code) => {
    clearTimeout(timeoutId);
    if (code !== 0 && code !== null && collectedText === "") {
      fail(new Error(`agent acp exited with code ${code}`));
    }
  });

  const work = (async () => {
    await send("initialize", {
      clientCapabilities: {
        fs: { readTextFile: false, writeTextFile: false },
        terminal: false,
      },
      clientInfo: { name: "@better-commit/cli", version: "0.0.0" },
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
    clearTimeout(timeoutId);
    proc.stdin?.end();
    await once(proc, "close");
    return collectedText.trim() || "feat: update";
  })();

  try {
    return await Promise.race([work, fatal.promise]);
  } catch (error) {
    clearTimeout(timeoutId);
    proc.kill("SIGTERM");
    throw error instanceof Error ? error : new Error(String(error));
  } finally {
    rl.close();
  }
};

export const cursorAcpProvider: AIProvider = {
  generateMessage(diff: string, context: GenerateMessageContext) {
    const prompt = buildCommitPrompt(diff, context, context.customPrompt);
    return runCursorAcp(prompt);
  },
  name: "cursor-acp",
};
