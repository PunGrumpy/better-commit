# better-commit

TypeScript-first conventional commits with a single **`commit.config.ts`**, composable plugins, and optional AI suggestions. Configure with `defineConfig` and plugins.

## Install

Project-local (recommended):

```bash
bun add -D better-commit
# or
npm install -D better-commit
```

Global:

```bash
bun add -g better-commit
```

## Usage

```bash
bc              # Interactive commit (default)
bc commit       # Same as above
bc init         # Create commit.config.ts
bc doctor       # Verify setup (Node, config load, plugins, providers)
bc check        # Validate last commit message against your rules
```

### Options

| Option            | Commands    | Description                     |
| ----------------- | ----------- | ------------------------------- |
| `--no-ai`         | commit, fix | Skip AI (manual / local only)   |
| `--dry-run`       | commit      | Show message without committing |
| `-q, --quiet`     | init        | Skip overwrite prompt           |
| `-e, --edit`      | check       | Validate `COMMIT_EDITMSG`       |
| `--from` / `--to` | check       | Validate commit range           |

## Configuration

Create **`commit.config.ts`** in the project root (run `bc init` for a template). Discovery walks up from the current directory and loads the first of: `commit.config.ts`, `commit.config.mts`, `commit.config.js`.

```typescript
import {
  aiSuggest,
  conventionalCommits,
  defineConfig,
} from "better-commit/config";

export default defineConfig({
  plugins: [
    conventionalCommits({
      types: ["feat", "fix", "docs", "style", "refactor", "test", "chore"],
      // scopes: ["api", "web"],      // optional allowlist
      // strictScopes: true,          // enforce scope list on `bc check`
    }),
    aiSuggest({ provider: "auto" }), // optional; omit for offline-only
  ],
});
```

- **`conventionalCommits`** — required. Supplies allowed **types** and optional **scopes**.
- **`aiSuggest`** — optional. Enables AI providers; without it, commits are manual / heuristic only.

Set `BETTER_COMMIT_NO_AI=1` to disable AI even when `aiSuggest` is present.

### Public API (`better-commit/config`)

Exporting `defineConfig`, `conventionalCommits`, and `aiSuggest` from **`better-commit/config`** keeps the CLI entry small and gives you types for your config file.

## AI providers

With **`aiSuggest`**, provider hints match the CLI resolution order (see `bc doctor`):

| Provider     | Notes                                       |
| ------------ | ------------------------------------------- |
| `auto`       | Detect Cursor, Claude Code, Codex; else ask |
| `local`      | Heuristic from paths (no API)               |
| `openai`     | Needs `OPENAI_API_KEY`                      |
| `anthropic`  | Needs `ANTHROPIC_API_KEY`                   |
| `cursor`     | Cursor ACP                                  |
| `claude-cli` | Claude CLI                                  |
| `codex-exec` | Codex exec                                  |

## Git hooks

Example Husky **`prepare-commit-msg`**:

```bash
exec bc commit
```

For CI, use the same rules as locally:

```bash
bc check
```

## Security

- Diffs are sanitized before sending to AI (common secret patterns redacted).
- Prefer project-local installs so `commit.config.ts` and lockfile stay reproducible.

## Package layout

**better-auth–style layering:** **`config/`** (jiti load + merge + shared types/errors), **`core/`** (format, git, validate, cache, sanitize), **`plugins/`** (e.g. `conventionalCommits`, `aiSuggest`), **`ai/`** (message providers + registry), **`prompts/`**, **`commands/`**, **`integrations/`**, root **`public-config.ts`** (npm `better-commit/config`), **`index.ts`** (CLI). Static prompts live under repo **`config/prompts/`**. **`__tests__/`**; **tsdown** emits `dist/index.mjs` and `dist/public-config.mjs`.
