import type { UserConfig } from "@better-commit/cli/config";
import {
  aiSuggest,
  conventionalCommits,
  defineConfig,
} from "@better-commit/cli/config";

const config: UserConfig = {
  plugins: [
    conventionalCommits({
      types: [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "perf",
        "ci",
        "build",
      ],
    }),
    aiSuggest({ provider: "auto" }),
  ],
};

export default defineConfig(config);
