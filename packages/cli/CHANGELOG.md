# better-commit

## 1.0.0

### Major Changes

- 704fd10: **AI, prompts, and core runtime**

  Optional AI message generation (registry, cloud/subprocess/local providers), interactive prompts and form fields, git helpers, validation against resolved rules, diff sanitization, and retry cache.

  _Suggested git pairing: commit ที่แตะ `packages/cli/src/ai/`, `packages/cli/src/prompts/`, `packages/cli/src/core/`, `agents.ts`._

- 704fd10: **Build & breaking note**

  ESM output via **tsdown** (`dist/index.mjs`, `dist/public-config.mjs` for **`better-commit/config`**). **Major** release: new public API and config shape; no automated migration from older JSON-based config.

  _Suggested git pairing: commit ที่แตะ `tsdown.config.ts`, `package.json` exports, หรือเรื่อง release/breaking._

- 704fd10: **CLI commands**

  Commander-based **`bc`** binary: default **`bc commit`** (interactive), **`bc init`**, **`bc doctor`**, **`bc check`**, **`bc fix`**, **`bc retry`**, plus flags such as `--dry-run` and `--no-ai`.

  _Suggested git pairing: commit ที่แตะ `packages/cli/src/index.ts`, `packages/cli/src/commands/`, และพฤติกรรม CLI._

- 704fd10: **Commit config & plugins**

  Single **`commit.config.ts`** with **`defineConfig`**, typed plugins (**`conventionalCommits`**, optional **`aiSuggest`**), jiti-based loading, merge/validation via **`mergeUserConfig`**, and the **`better-commit/config`** package export for apps and libraries.

  _Suggested git pairing: commit ที่แตะแค่ `packages/cli/src/config/`, `packages/cli/src/plugins/`, `public-config.ts`, และเอกสาร config._
