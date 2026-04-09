import type { UserConfig } from "./config/types.js";

export {
  DuplicatePluginError,
  MissingConventionalPluginError,
} from "./config/errors.js";
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

export function defineConfig(config: UserConfig): UserConfig {
  return config;
}
