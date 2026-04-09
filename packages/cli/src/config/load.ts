import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { createJiti } from "jiti";

import { ConfigLoadError } from "./config-load-error.js";
import { mergeUserConfig } from "./resolve.js";
import type { ResolvedCommitConfig, UserConfig } from "./types.js";

export { ConfigLoadError } from "./config-load-error.js";
export type { ConfigErrorCode } from "./config-error-code.js";

const CONFIG_FILENAMES = [
  "commit.config.ts",
  "commit.config.mts",
  "commit.config.js",
] as const;

const walkUpDirectories = (startDir: string): string[] => {
  const dirs: string[] = [];
  let current = resolve(startDir);
  while (true) {
    dirs.push(current);
    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return dirs;
};

export const findCommitConfigPath = (
  cwd: string = process.cwd()
): string | null => {
  for (const dir of walkUpDirectories(cwd)) {
    for (const name of CONFIG_FILENAMES) {
      const full = join(dir, name);
      if (existsSync(full)) {
        return full;
      }
    }
  }
  return null;
};

const loadModule = (configPath: string): unknown => {
  const jiti = createJiti(import.meta.url, {
    interopDefault: true,
  });
  try {
    return jiti(configPath);
  } catch (error) {
    throw new ConfigLoadError(
      "load_failed",
      `Failed to load ${configPath}: ${String(error)}`,
      { cause: error, pathTried: configPath }
    );
  }
};

export const loadUserConfigSync = (configPath: string): UserConfig => {
  const mod = loadModule(configPath) as { default?: unknown } | UserConfig;
  const raw =
    mod !== null &&
    typeof mod === "object" &&
    "default" in mod &&
    mod.default !== undefined
      ? mod.default
      : mod;
  if (
    raw === null ||
    typeof raw !== "object" ||
    !("plugins" in raw) ||
    !Array.isArray((raw as UserConfig).plugins)
  ) {
    throw new ConfigLoadError(
      "invalid_export",
      `commit config must export defineConfig({ plugins: [...] }). Check ${configPath}.`,
      { pathTried: configPath }
    );
  }
  return raw as UserConfig;
};

export const loadResolvedConfigFromPath = (
  configPath: string
): ResolvedCommitConfig => {
  const user = loadUserConfigSync(configPath);
  try {
    return mergeUserConfig(user);
  } catch (error) {
    if (error instanceof ConfigLoadError) {
      throw error;
    }
    throw new ConfigLoadError(
      "merge_failed",
      error instanceof Error ? error.message : String(error),
      { cause: error, pathTried: configPath }
    );
  }
};

export const loadResolvedConfig = (
  cwd: string = process.cwd()
): {
  config: ResolvedCommitConfig;
  path: string;
} => {
  const path = findCommitConfigPath(cwd);
  if (!path) {
    throw new ConfigLoadError(
      "missing",
      "No commit.config.ts (or .mts / .js) found. Run `bc init` or add commit.config.ts in the project root.",
      { pathTried: join(cwd, "commit.config.ts") }
    );
  }
  return {
    config: loadResolvedConfigFromPath(path),
    path,
  };
};
