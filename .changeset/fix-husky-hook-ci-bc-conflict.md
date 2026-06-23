---
"@better-commit/cli": patch
---

Fix Husky `prepare-commit-msg` hook in CI: skip when `CI` is set or no TTY is available, and invoke `better-commit` instead of `bc` to avoid GNU bc (calculator) on Linux.
