import type { BetterCommitPlugin } from "../config/types.js";

export function conventionalCommits(options: {
  scopes?: string[];
  strictScopes?: boolean;
  types: string[];
}): BetterCommitPlugin {
  const hasScopeList =
    options.scopes !== undefined && options.scopes.length > 0;
  return {
    apiVersion: 1,
    id: "conventional-commits",
    rules: {
      scopes: options.scopes,
      strictScopes: options.strictScopes ?? hasScopeList,
      types: options.types,
    },
  };
}
