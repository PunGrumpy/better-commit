import { spawn } from "node:child_process";
import { once } from "node:events";
import { createReadStream, existsSync, rmSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { createInterface } from "node:readline";

import {
  buildCommitPrompt,
  getShortPromptHint,
} from "../prompts/commit-prompt.js";
import { assertNonEmptyAiOutput } from "./assert-output.js";
import {
  isPermissionRejection,
  resolveCursorPermission,
} from "./cursor-permissions.js";
import type { AcpPermissionOption } from "./cursor-permissions.js";
import type { AIProvider, GenerateMessageContext } from "./types.js";

interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  reject: (reason?: unknown) => void;
  resolve: (value: T | PromiseLike<T>) => void;
}

const promiseWithResolvers = <T>(): PromiseWithResolvers<T> =>
  (
    Promise as unknown as {
      withResolvers: <R>() => PromiseWithResolvers<R>;
    }
  ).withResolvers<T>();

const CODEX_TIMEOUT_MS = 30_000;

const runCodexProcess = async (prompt: string): Promise<string> => {
  const proc = spawn("codex", ["exec", "-"], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "pipe"],
  });

  proc.stdin?.write(prompt);
  proc.stdin?.end();

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
    return assertNonEmptyAiOutput(stdout, "Codex exec");
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

const runClaudeProcess = async (
  args: string[],
  tmpDir: string
): Promise<string> => {
  const proc = spawn("claude", args, {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "pipe"],
  });

  const tmpPath = path.join(tmpDir, "prompt.txt");
  const { stdin } = proc;
  if (stdin) {
    createReadStream(tmpPath).pipe(stdin);
  }
  proc.on("close", () => {
    rmSync(tmpDir, { force: true, recursive: true });
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
      const text = json.result?.trim() ?? "";
      return assertNonEmptyAiOutput(text, "Claude CLI");
    } catch (error) {
      if (error instanceof Error && error.message.includes("empty message")) {
        throw error;
      }
      throw new Error("Failed to parse Claude CLI output", { cause: error });
    }
  } finally {
    clearTimeout(timeoutId);
  }
};

export const claudeCliProvider: AIProvider = {
  async generateMessage(diff: string, context: GenerateMessageContext) {
    const prompt = buildCommitPrompt(diff, context, context.customPrompt);
    const tmpDir = await mkdtemp(path.join(tmpdir(), "better-commit-"));
    const tmpPath = path.join(tmpDir, "prompt.txt");
    await writeFile(tmpPath, prompt, "utf-8");

    const args = ["-p", getShortPromptHint(), "--output-format", "json"];
    return runClaudeProcess(args, tmpDir);
  },
  name: "claude-cli",
};

const AGENT_PATHS = ["agent", path.join(homedir(), ".local", "bin", "agent")];

let cachedAgentCommand: string | null = null;

const findAgentCommand = (): string => {
  if (cachedAgentCommand !== null) {
    return cachedAgentCommand;
  }
  for (const agentPath of AGENT_PATHS) {
    if (agentPath === "agent") {
      cachedAgentCommand = "agent";
      return "agent";
    }
    if (existsSync(agentPath)) {
      cachedAgentCommand = agentPath;
      return agentPath;
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

interface PendingPermissionRequest {
  id: number;
  options: AcpPermissionOption[];
  title: string;
}

interface AcpIncomingMessage {
  error?: { message: string };
  id?: number;
  method?: string;
  params?: {
    options?: AcpPermissionOption[];
    toolCall?: { title?: string };
    update?: { sessionUpdate?: string; content?: { text?: string } };
  };
  result?: unknown;
}

const isDefinedAcpId = (id: number | undefined | null): id is number =>
  id !== undefined && id !== null;

const handleAcpRpcResponse = (
  msg: AcpIncomingMessage,
  pending: Map<
    number,
    { reject: (e: Error) => void; resolve: (v: unknown) => void }
  >
): boolean => {
  if (!isDefinedAcpId(msg.id)) {
    return false;
  }

  const hasResult = msg.result !== undefined && msg.result !== null;
  const hasError = msg.error !== undefined && msg.error !== null;
  if (!hasResult && !hasError) {
    return false;
  }

  const waiter = pending.get(msg.id);
  if (!waiter) {
    return true;
  }

  pending.delete(msg.id);
  if (msg.error) {
    waiter.reject(new Error(msg.error.message));
  } else {
    waiter.resolve(msg.result);
  }
  return true;
};

const appendAcpAgentMessage = (
  msg: AcpIncomingMessage,
  collectedText: string
): string => {
  if (msg.method !== "session/update") {
    return collectedText;
  }

  const update = msg.params?.update;
  if (
    update?.sessionUpdate !== "agent_message_chunk" ||
    !update.content?.text
  ) {
    return collectedText;
  }

  return collectedText + update.content.text;
};

const parseAcpPermissionRequest = (
  msg: AcpIncomingMessage
): PendingPermissionRequest | null => {
  if (msg.method !== "session/request_permission" || !isDefinedAcpId(msg.id)) {
    return null;
  }

  return {
    id: msg.id,
    options: msg.params?.options ?? [],
    title: msg.params?.toolCall?.title ?? "Permission requested",
  };
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
  const permissionQueue: PendingPermissionRequest[] = [];
  let permissionSignal = promiseWithResolvers<null>();
  let procClosed = false;

  const notifyPermissionWaiter = () => {
    permissionSignal.resolve(null);
    permissionSignal = promiseWithResolvers<null>();
  };

  const markProcClosed = () => {
    procClosed = true;
    notifyPermissionWaiter();
  };

  const waitForPermissionRequest = async (): Promise<boolean> => {
    if (permissionQueue.length > 0) {
      return true;
    }
    if (procClosed) {
      return false;
    }
    await permissionSignal.promise;
    if (permissionQueue.length > 0) {
      return true;
    }
    return !procClosed;
  };

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
      const msg = JSON.parse(line) as AcpIncomingMessage;
      if (handleAcpRpcResponse(msg, pending)) {
        return;
      }

      collectedText = appendAcpAgentMessage(msg, collectedText);

      const permissionRequest = parseAcpPermissionRequest(msg);
      if (permissionRequest) {
        permissionQueue.push(permissionRequest);
        notifyPermissionWaiter();
      }
    } catch {
      // ignore parse errors
    }
  });

  proc.stderr?.on("data", () => {
    // ignore stderr
  });

  proc.on("error", (err) => {
    fail(err instanceof Error ? err : new Error(String(err)));
  });

  proc.on("exit", (code) => {
    if (code !== 0 && code !== null && collectedText === "") {
      fail(new Error(`agent acp exited with code ${code}`));
    }
  });

  proc.on("close", () => {
    markProcClosed();
  });

  const respondToPermissionRequest = async (
    request: PendingPermissionRequest
  ): Promise<boolean> => {
    const optionId = await resolveCursorPermission(
      request.title,
      request.options
    );
    respond(request.id, {
      outcome: { optionId, outcome: "selected" },
    });

    if (isPermissionRejection(optionId, request.options)) {
      fail(new Error(`Cursor permission denied: ${request.title}`));
      return false;
    }

    return true;
  };

  const handlePermissions = async (): Promise<void> => {
    const processNext = async (): Promise<void> => {
      const hasWork = await waitForPermissionRequest();
      if (!hasWork) {
        return;
      }

      const request = permissionQueue.shift();
      if (!request) {
        if (procClosed) {
          return;
        }
        return processNext();
      }

      const shouldContinue = await respondToPermissionRequest(request);
      if (!shouldContinue) {
        return;
      }

      return processNext();
    };

    await processNext();
  };

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
    proc.stdin?.end();
    await once(proc, "close");
    return assertNonEmptyAiOutput(collectedText, "Cursor ACP");
  })();

  try {
    return await Promise.race([
      Promise.all([handlePermissions(), work]).then(([, result]) => result),
      fatal.promise,
    ]);
  } catch (error) {
    proc.kill("SIGTERM");
    throw error instanceof Error ? error : new Error(String(error));
  } finally {
    clearTimeout(timeoutId);
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
