export type ConfigErrorCode =
  | "duplicate_plugin"
  | "invalid_export"
  | "load_failed"
  | "merge_failed"
  | "missing";

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

export class DuplicatePluginError extends Error {
  public readonly pluginId: string;

  public constructor(pluginId: string) {
    super(`Duplicate plugin id: "${pluginId}"`);
    this.name = "DuplicatePluginError";
    this.pluginId = pluginId;
  }
}

export class MissingConventionalPluginError extends Error {
  public constructor() {
    super(
      "Missing required plugin: conventionalCommits(). Add conventionalCommits({ types: [...] }) to the plugins array in commit.config.ts."
    );
    this.name = "MissingConventionalPluginError";
  }
}
