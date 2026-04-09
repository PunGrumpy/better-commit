/** Public plugin + resolved config model (better-auth–style: one typed surface). */

export interface ValidationResult {
  errors: string[];
  valid: boolean;
  warnings: string[];
}

export const PLUGIN_API_VERSION = 1;

export type ProviderName =
  | "auto"
  | "local"
  | "openai"
  | "anthropic"
  | "cursor"
  | "claude-cli"
  | "codex-exec";

export interface BetterCommitPlugin {
  apiVersion?: number;
  hooks?: {
    validateMessage?: (
      message: string
    ) => ValidationResult | Promise<ValidationResult>;
  };
  id: string;
  rules?: {
    scopes?: string[];
    strictScopes?: boolean;
    types?: string[];
  };
  ai?: {
    allowUnsanitized?: boolean;
    customPrompt?: string;
    model?: string;
    provider: ProviderName;
  };
}

export interface UserConfig {
  plugins: BetterCommitPlugin[];
}

export interface ResolvedCommitConfig {
  ai?: {
    allowUnsanitized: boolean;
    customPrompt?: string;
    model?: string;
    provider: ProviderName;
  };
  pluginIds: string[];
  rules: {
    scopes: string[] | undefined;
    strictScopes: boolean;
    types: string[];
  };
}
