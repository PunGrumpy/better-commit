import type { ConfigErrorCode } from "./config-error-code.js";

export class ConfigLoadError extends Error {
  public readonly cause?: unknown;
  public readonly code: ConfigErrorCode;
  public readonly pathTried?: string;

  public constructor(
    code: ConfigLoadError["code"],
    message: string,
    options?: { cause?: unknown; pathTried?: string }
  ) {
    super(message);
    this.name = "ConfigLoadError";
    this.code = code;
    this.cause = options?.cause;
    this.pathTried = options?.pathTried;
  }
}
