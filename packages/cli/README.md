# better-commit

AI-powered commit message tool similar to Commitizen. Generate conventional commits with AI suggestions from OpenAI, Anthropic, or local heuristics.

## Install

```bash
bun add -g better-commit
# or
npm install -g better-commit
```

## Usage

```bash
bc              # Interactive commit (default)
bc commit       # Same as above
bc init         # Create .better-commit.json
bc doctor       # Verify setup
```

## Options

| Option      | Description                        |
| ----------- | ---------------------------------- |
| `--no-ai`   | Skip AI, use manual/heuristic only |
| `--dry-run` | Show message without committing    |

## Configuration

Run `bc init` to create `.better-commit.json`:

```json
{
  "provider": "local",
  "conventionalTypes": [
    "feat",
    "fix",
    "docs",
    "style",
    "refactor",
    "test",
    "chore"
  ],
  "allowUnsanitized": false
}
```

### Providers

| Provider    | Env var             | Description                        |
| ----------- | ------------------- | ---------------------------------- |
| `local`     | —                   | Heuristic from file paths (no API) |
| `openai`    | `OPENAI_API_KEY`    | OpenAI GPT                         |
| `anthropic` | `ANTHROPIC_API_KEY` | Anthropic Claude                   |

## Git hooks

Use with husky for automatic better-commit on `git commit`:

```bash
bc init
# Add to .husky/prepare-commit-msg: exec bc commit
```

## Diff rendering

Diffs are used as **data** (AI input), not displayed to users. For future use cases:

| Context | Library | Notes |
|---------|---------|-------|
| CLI (terminal) | [delta](https://github.com/dandavison/delta) / diff-so-fancy | ANSI-based; use if adding diff display to CLI |
| Web UI | [@pierre/diffs](https://diffs.com/) | Shiki-based; use for dashboards, webviews, code review UIs |

The CLI does not render diffs; it sends sanitized plain text to AI providers.

## Security

- Diffs are sanitized before sending to AI (secrets, API keys redacted)
- Set `BETTER_COMMIT_NO_AI=1` to disable AI entirely
- `allowUnsanitized: false` (default) — never send raw diff if sanitization fails
