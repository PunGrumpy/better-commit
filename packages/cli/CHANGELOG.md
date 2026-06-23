# @better-commit/cli

## 1.2.0

### Minor Changes

- 935b935: Add interactive file staging when committing with unstaged files, allowing users to select a subset of files to stage and commit.
- 35f9df3: Add support for intra-PR commit-level stacking:

  - Introduce the `stacking` plugin to automatically generate and inject stable `Change-Id` footers into commits.
  - Add `bc stack` command to view the local commit stack, positions, and Change-Ids.
  - Add `bc amend <target>` command to stage changes into intermediate commits using a headless Git autosquash rebase.
  - Validate `Change-Id` existence in commit messages under CI check mode.

### Patch Changes

- 28a6720: Remove `catalog:` dependencies to resolve bun/npm install errors on published CLI packages.

## 1.1.0

### Minor Changes

- 1cd0e2f: Invoke plugin `validateMessage` hooks during commit message validation.
- 4c15f4e: Add `bc init --hooks` to install Husky `prepare-commit-msg` hook for interactive commits.

### Patch Changes

- fe1acad: Validate commit messages before git commit, amend, and retry so interactive flows match `bc check` rules.
- 6d6cfa6: Improve AI security: expand diff secret redaction, pass prompts via stdin, prompt for Cursor ACP permissions by default, reject empty AI output, and fix Cursor ACP hang timeout.
- aed40f7: Honor `aiSuggest` `model` and `allowUnsanitized` config options; cloud providers always sanitize diffs.
- b49ef2f: Expand npm README with commands, options, environment variables, and security notes.
- 41c97cb: Link npm README to the docs site.
- c7ae9bb: Fix Husky `prepare-commit-msg` hook in CI: skip when `CI` is set or no TTY is available, and invoke `better-commit` instead of `bc` to avoid GNU bc (calculator) on Linux.
- 7517e43: Fix Husky `prepare-commit-msg` hook: add `bc commit --hook` to write `COMMIT_EDITMSG` instead of nesting `git commit`, reattach TTY, skip re-entry with `BETTER_COMMIT_SKIP_HOOK`, and avoid opening a second editor with `GIT_EDITOR=cat`.

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
