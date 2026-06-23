---
"@better-commit/cli": patch
---

Fix Husky `prepare-commit-msg` hook: add `bc commit --hook` to write `COMMIT_EDITMSG` instead of nesting `git commit`, reattach TTY, skip re-entry with `BETTER_COMMIT_SKIP_HOOK`, and avoid opening a second editor with `GIT_EDITOR=cat`.
