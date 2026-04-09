# @better-commit/cli

## 1.0.0

### Major Changes

- 704fd10: **AI, prompts, and core runtime**

  Optional AI message generation (registry, cloud/subprocess/local providers), interactive prompts and form fields, git helpers, validation against resolved rules, diff sanitization, and retry cache.

- 704fd10: **Build & breaking note**

  ESM output via **tsdown** (`dist/index.mjs`, `dist/public-config.mjs` for **`@better-commit/cli/config`**). **Major** release: new public API and config shape; no automated migration from older JSON-based config.

- 704fd10: **CLI commands**

  Commander-based **`bc`** binary: default **`bc commit`** (interactive), **`bc init`**, **`bc doctor`**, **`bc check`**, **`bc fix`**, **`bc retry`**, plus flags such as `--dry-run` and `--no-ai`.

- fc4c9a3: **CLI parsing, init safety, and check rules**

  - **Breaking:** `bc init --quiet` no longer overwrites an existing `commit.config.ts`; use `--force` with `--quiet` to replace it.
  - Entry uses `parseAsync` and a top-level `try`/`catch` so async command failures surface reliably.
  - `bc check` requires `--from` and `--to` together and disallows combining `--edit` with a range.
  - `bc commit --dry-run` uses the same explicit success exit path as other commands.
  - `bc fix` matches `bc commit` for `provider: "auto"` (including the use-AI prompt when detection is ambiguous).
  - `bc doctor` emits a one-line failure summary (failed check names) on exit.
  - Duplicate plugin merge errors surface as `ConfigLoadError` with code `duplicate_plugin`.
  - `--help` notes `bc` / `better-commit` and `BETTER_COMMIT_NO_AI`; README covers `fix`, `retry`, and check modes.

- 704fd10: **Commit config & plugins**

  Single **`commit.config.ts`** with **`defineConfig`**, typed plugins (**`conventionalCommits`**, optional **`aiSuggest`**), jiti-based loading, merge/validation via **`mergeUserConfig`**, and the **`@better-commit/cli/config`** package export for apps and libraries.
