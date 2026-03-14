---
name: better-commit
description: Use better-commit CLI for AI-powered conventional commits. Run `bc` or `bc commit` to create commits with AI-generated messages. Use `bc init` to configure, `bc doctor` to verify setup.
tags:
  - cli
  - commit
  - conventional-commits
  - ai
---

# better-commit

AI-powered commit message tool similar to Commitizen. Generates conventional commits from staged diffs using OpenAI, Anthropic, Cursor ACP, or local heuristics.

## When to Use

- Creating commits with conventional commit format (type(scope): subject)
- Generating commit messages from staged diff
- Amending the last commit message (`bc fix`)
- Validating commit messages (`bc check`)
- Retrying a commit with cached data (`bc retry`)
- Enforcing consistent commit style across the team

## Commands

| Command | Description |
|---------|-------------|
| `bc` / `bc commit` | Interactive commit (default) |
| `bc init` | Create .better-commit.json |
| `bc doctor` | Verify setup |
| `bc check` | Validate commit messages |
| `bc fix` | Amend last commit message |
| `bc retry` | Retry commit with cached data |

## Options

| Option | Commands | Description |
|--------|----------|-------------|
| `--no-ai` | commit, fix | Skip AI, use manual/heuristic only |
| `--dry-run` | commit | Show message without committing |
| `-q, --quiet` | init | Skip prompts |
| `-e, --edit` | check | Validate COMMIT_EDITMSG |
| `--from <ref>` | check | Start of range (with --to) |
| `--to <ref>` | check | End of range (with --from) |

## Providers

Configure in `.better-commit.json`:

| Provider | Env var | Description |
|----------|---------|-------------|
| `auto` | — | Detect Cursor, Claude Code, or Codex; fallback to local |
| `local` | — | Heuristic from file paths (no API) |
| `openai` | `OPENAI_API_KEY` | OpenAI GPT |
| `anthropic` | `ANTHROPIC_API_KEY` | Anthropic Claude |
| `cursor` | — | Cursor ACP (agent acp) |
| `claude-cli` | — | Claude CLI |
| `codex-exec` | — | Codex exec |

## Setup

```bash
bc init
```

## Git Hooks

Add to `.husky/prepare-commit-msg`:

```bash
exec bc commit
```

## Environment

- `BETTER_COMMIT_NO_AI=1` — Disable AI entirely (use manual/heuristic)

## Security

- Diffs are sanitized before sending to AI (secrets, API keys redacted)
- `allowUnsanitized: false` (default) — never send raw diff if sanitization fails

## Diff Rendering

Diffs are used as data (AI input), not displayed. For future use: [delta](https://github.com/dandavison/delta) for terminal; [@pierre/diffs](https://diffs.com/) for web UIs.
