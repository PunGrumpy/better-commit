---
"@better-commit/cli": major
---

**CLI parsing, init safety, and check rules**

- **Breaking:** `bc init --quiet` no longer overwrites an existing `commit.config.ts`; use `--force` with `--quiet` to replace it.
- Entry uses `parseAsync` and a top-level `try`/`catch` so async command failures surface reliably.
- `bc check` requires `--from` and `--to` together and disallows combining `--edit` with a range.
- `bc commit --dry-run` uses the same explicit success exit path as other commands.
- `bc fix` matches `bc commit` for `provider: "auto"` (including the use-AI prompt when detection is ambiguous).
- `bc doctor` emits a one-line failure summary (failed check names) on exit.
- Duplicate plugin merge errors surface as `ConfigLoadError` with code `duplicate_plugin`.
- `--help` notes `bc` / `better-commit` and `BETTER_COMMIT_NO_AI`; README covers `fix`, `retry`, and check modes.
