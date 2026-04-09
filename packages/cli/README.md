# @better-commit/cli

**Conventional commits from one `commit.config.ts`:** plugins (`conventionalCommits`, optional `aiSuggest`), same rules in CI via **`bc check`**.

<div>
  <a href="https://www.npmjs.com/package/@better-commit/cli"><img src="https://img.shields.io/npm/v/@better-commit/cli" alt="npm version" /></a>
  <a href="https://github.com/pungrumpy/better-commit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@better-commit/cli" alt="license" /></a>
</div>

## Quick start

```bash
npm install -D @better-commit/cli   # or: bun add -D @better-commit/cli
bc init && bc
```

Binaries: **`bc`** and **`better-commit`** (same CLI). **`bc doctor`** checks Node, config, plugins, and AI providers. Global install: `bun add -g @better-commit/cli`.

## Commands & flags

- **`bc`** / **`bc commit`** — interactive commit · **`bc init`** — scaffold config · **`bc doctor`** — verify setup
- **`bc check`** — validate message(s) · **`bc fix`** — amend last message · **`bc retry`** — reuse cached form data

**Flags:** `--no-ai` (commit, fix) · `--dry-run` (commit) · `-q` / `-f` (init) · `-e` / `--edit` (check: `COMMIT_EDITMSG`) · `--from` + `--to` (check: range; pass both). `bc check` modes are mutually exclusive: last commit (default), `--edit`, or `--from`/`--to`.

**Env:** `BETTER_COMMIT_NO_AI=1` disables AI (same as `--no-ai`), including when `aiSuggest` is configured.

## Config

Discovery walks up for `commit.config.ts`, `commit.config.mts`, or `commit.config.js`. Import from **`@better-commit/cli/config`**:

```typescript
import {
  aiSuggest,
  conventionalCommits,
  defineConfig,
} from "@better-commit/cli/config";

export default defineConfig({
  plugins: [
    conventionalCommits({
      types: ["feat", "fix", "docs", "style", "refactor", "test", "chore"],
    }),
    aiSuggest({ provider: "auto" }),
  ],
});
```

`conventionalCommits` is required (types, optional scopes / `bc check` strictness). `aiSuggest` is optional.

## AI providers

With `aiSuggest`, `provider` follows the same order as **`bc doctor`**: `auto`, `local`, `openai` (`OPENAI_API_KEY`), `anthropic` (`ANTHROPIC_API_KEY`), `cursor`, `claude-cli`, `codex-exec`.

## Hooks & CI

```bash
# e.g. Husky prepare-commit-msg
exec bc commit
```

```bash
bc check
```

## Security

Diffs are sanitized before AI calls. Prefer a local devDependency so config and lockfile stay reproducible.
