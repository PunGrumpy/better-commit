---
name: better-commit
description: Use better-commit CLI for TypeScript-first conventional commits. Run `bc` or `bc commit` interactively. Configure via root `commit.config.ts` with `defineConfig` and plugins from `better-commit/config`.
tags:
  - cli
  - commit
  - conventional-commits
  - ai
---

# better-commit

Interactive conventional commits with optional AI, driven by **`commit.config.ts`** (plugins, resolved rules). Validates with **`bc check`** using the same rules as the interactive flow.

## When to use

- Creating commits in `type(scope): subject` form with allowed types/scopes from config
- Generating messages from staged diff (with **`aiSuggest`** plugin)
- Amending the last message (`bc fix`)
- Validating messages (`bc check`, including `COMMIT_EDITMSG` or a ref range)
- Bootstrapping config (`bc init` → `commit.config.ts`)

## Commands

| Command | Description |
| ------- | ----------- |
| `bc` / `bc commit` | Interactive commit (default) |
| `bc init` | Create `commit.config.ts` |
| `bc doctor` | Verify config loads, list plugins, providers |
| `bc check` | Validate last commit (or `--edit` / `--from`–`--to`) |
| `bc fix` | Amend last commit message |
| `bc retry` | Retry commit from cache |

## Options

| Option | Commands | Description |
| ------ | -------- | ----------- |
| `--no-ai` | commit, fix | Skip AI |
| `--dry-run` | commit | Preview message only |
| `-q, --quiet` | init | Skip prompts |
| `-e, --edit` | check | Validate `COMMIT_EDITMSG` |
| `--from` / `--to` | check | Validate commit range |

## Configuration

Use **`commit.config.ts`** at the repo root (see `bc init`). Import helpers from **`better-commit/config`**:

```typescript
import {
  aiSuggest,
  conventionalCommits,
  defineConfig,
} from "better-commit/config";

export default defineConfig({
  plugins: [
    conventionalCommits({ types: ["feat", "fix", "docs", "chore"] }),
    aiSuggest({ provider: "auto" }),
  ],
});
```

Omit **`aiSuggest`** for offline-only / manual commits.

## Environment

- `BETTER_COMMIT_NO_AI=1` — disable AI even if `aiSuggest` is configured

## Git hooks

Example `.husky/prepare-commit-msg`:

```bash
exec bc commit
```

## Security

- Diffs are sanitized before AI calls
- Prefer local `better-commit` install for reproducible config loading
