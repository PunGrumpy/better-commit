# better-commit

**TypeScript-first conventional commits from a single `commit.config.ts` — composable plugins, optional AI, and the same rules in CI.**

better-commit helps you and your AI tools ship consistent commit messages without juggling ad hoc scripts. One config file, one CLI (`bc` / `better-commit`), and you are productive in minutes.

<div>
  <a href="https://www.npmjs.com/package/@better-commit/cli"><img src="https://img.shields.io/npm/v/@better-commit/cli" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@better-commit/cli"><img src="https://img.shields.io/npm/dm/@better-commit/cli" alt="npm downloads" /></a>
  <a href="https://github.com/PunGrumpy/better-commit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@better-commit/cli" alt="license" /></a>
</div>

## Quick Start

```sh
npm install -D @better-commit/cli
bc init
bc
```

`bc` runs the interactive commit flow. Use `bc doctor` to verify Node, config load, plugins, and AI providers. Non-interactive `bc init` supports `-q`; add `-f` to replace an existing file.

## What you get

- **`conventionalCommits`** — Allowed types and optional scopes; drives validation in `bc check`.
- **`defineConfig` + plugins** — Compose `conventionalCommits` (required) and optional **`aiSuggest`** for message suggestions.
- **`bc check`** — Validate the last message, `COMMIT_EDITMSG`, or a ref range — same rules as locally, ideal for CI.

## Key Features

### ⚡ Interactive first

`bc` and `bc commit` guide the message; `bc fix` amends the last commit; `bc retry` reuses cached form data when you need another try.

### 🎯 One config file

Discovery walks up for `commit.config.ts`, `commit.config.mts`, or `commit.config.js`. Import helpers from **`@better-commit/cli/config`** for typed, small surface area.

### 🤖 AI-ready, not AI-required

Optional `aiSuggest` plugs into Cursor, Claude, Codex, OpenAI, Anthropic, and more. Use `--no-ai` or `BETTER_COMMIT_NO_AI=1` for fully manual flows.

### 🏗️ CI and hooks

Run `bc check` in pipelines; wire `exec bc commit` in Husky `prepare-commit-msg` so local commits match automation.

## Commands

| Command            | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `bc` / `bc commit` | Interactive commit (default)                         |
| `bc init`          | Create `commit.config.ts`                            |
| `bc doctor`        | Verify config loads, list plugins, providers         |
| `bc check`         | Validate last commit (or `--edit` / `--from`–`--to`) |
| `bc fix`           | Amend last commit message                            |
| `bc retry`         | Retry commit from cache                              |

## Options

| Option            | Commands    | Description               |
| ----------------- | ----------- | ------------------------- |
| `--no-ai`         | commit, fix | Skip AI                   |
| `--dry-run`       | commit      | Preview message only      |
| `-q, --quiet`     | init        | Skip prompts              |
| `-e, --edit`      | check       | Validate `COMMIT_EDITMSG` |
| `--from` / `--to` | check       | Validate commit range     |

## Environment variables

| Variable                            | Description                                              |
| ----------------------------------- | -------------------------------------------------------- |
| `BETTER_COMMIT_NO_AI=1`             | Disable AI even if `aiSuggest` is configured             |
| `OPENAI_API_KEY`                    | Optional; required for OpenAI provider                   |
| `ANTHROPIC_API_KEY`                 | Optional; required for Anthropic provider                |
| `BETTER_COMMIT_CURSOR_AUTO_APPROVE=1` | Auto-approve Cursor ACP tool permissions (default: prompt) |

## Security

- Diffs are sanitized before AI calls unless your config opts out via `allowUnsanitized`
- Cloud AI providers require credentials via environment variables (see above); never commit API keys

---

Install **`@better-commit/cli`** from npm. For full reference, see the **[docs site](https://better-commit.dev/docs)** (when available) or **[repository](https://github.com/pungrumpy/better-commit)** and package source.
