import type { UserConfig } from "./config/types.js";

export { DuplicatePluginError } from "./config/duplicate-plugin-error.js";
export { MissingConventionalPluginError } from "./config/missing-conventional-plugin-error.js";
export { mergeUserConfig } from "./config/resolve.js";
export { aiSuggest, conventionalCommits } from "./plugins/index.js";
export type {
  BetterCommitPlugin,
  ProviderName,
  ResolvedCommitConfig,
  UserConfig,
  ValidationResult,
} from "./config/types.js";
export { PLUGIN_API_VERSION } from "./config/types.js";

export const defineConfig = (config: UserConfig): UserConfig => config;
