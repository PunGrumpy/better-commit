<div align="center">
  <h1>better-commit</h1>

  <p><strong>TypeScript-first conventional commits from a single <code>commit.config.ts</code> — composable plugins, optional AI, and the same rules in CI.</strong></p>

<a href="https://www.npmjs.com/package/@better-commit/cli"><img alt="npm version" src="https://shieldcn.dev/npm/@better-commit/cli.svg?variant=default&size=default&font=geist-mono"></a>
<a href="https://www.npmjs.com/package/@better-commit/cli"><img alt="npm downloads" src="https://shieldcn.dev/npm/dm/@better-commit/cli.svg?size=default&font=geist-mono"></a>
<a href="https://github.com/PunGrumpy/better-commit/blob/main/LICENSE"><img alt="License" src="https://shieldcn.dev/npm/license/@better-commit/cli.svg?size=default&font=geist-mono"></a>
<a href="https://better-commit.vercel.app/docs"><img alt="Documentation" src="https://shieldcn.dev/badge/docs-better--commit.vercel.app.svg?size=default&font=geist-mono&logo=lu%3ANewspaper"></a>

</div>

better-commit helps you and your AI tools ship consistent commit messages without juggling ad hoc scripts. One config file, one CLI (`bc` / `better-commit`), and you are productive in minutes.

## The config file is the contract

A typical setup looks like this:

```text
my-app/
├── commit.config.ts          # types, scopes, optional aiSuggest
├── .husky/
│   └── prepare-commit-msg    # bc commit --hook (via git commit)
└── .github/workflows/
    └── commit-check.yml      # bc check
```

Discovery walks up for `commit.config.ts`, `commit.config.mts`, or `commit.config.js`. Import helpers from **`@better-commit/cli/config`** for a typed, small surface area.

Read the **[documentation](https://better-commit.vercel.app/docs)** for plugins, AI providers, hooks, and CI recipes.

## Quick start

```sh
npm install -D @better-commit/cli
bc init
bc
```

`bc` runs the interactive commit flow. Use `bc doctor` to verify Node, config load, plugins, and AI providers. Non-interactive `bc init` supports `-q`; add `-f` to replace an existing file.

> [!NOTE]
> The repository includes **`skills/SKILL.md`** with full CLI reference for coding agents. Install the package and point agents at that file, or read the docs site when you need more than this README.

### A minimal example

`bc init` creates a starter config. A trimmed version looks like:

```typescript
import { conventionalCommits, defineConfig } from "@better-commit/cli/config";

export default defineConfig({
  plugins: [conventionalCommits({ types: ["feat", "fix", "docs", "chore"] })],
});
```

```sh
bc doctor   # config loads, plugins listed
bc          # interactive commit
bc check    # same rules in CI
```

That is enforced commits everywhere — locally, in hooks, and in pipelines. Add **`aiSuggest`** when you want message suggestions from staged diffs.

## Git hooks

To integrate better-commit with your Git hooks:

```sh
bc init --hooks
# Requires Husky: npm install -D husky && npx husky init
```

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
| `--hooks`         | init        | Install Husky hooks       |
| `-e, --edit`      | check       | Validate `COMMIT_EDITMSG` |
| `--from` / `--to` | check       | Validate commit range     |

## Environment variables

| Variable                              | Description                                                       |
| ------------------------------------- | ----------------------------------------------------------------- |
| `BETTER_COMMIT_NO_AI=1`               | Disable AI even if `aiSuggest` is configured                      |
| `BETTER_COMMIT_SKIP_HOOK=1`           | Skip `prepare-commit-msg` hook (set automatically by `bc commit`) |
| `OPENAI_API_KEY`                      | Optional; required for OpenAI provider                            |
| `ANTHROPIC_API_KEY`                   | Optional; required for Anthropic provider                         |
| `BETTER_COMMIT_CURSOR_AUTO_APPROVE=1` | Auto-approve Cursor ACP tool permissions (default: prompt)        |

## Security

- Diffs are sanitized before AI calls unless your config opts out via `allowUnsanitized`
- Cloud AI providers require credentials via environment variables (see above); never commit API keys
