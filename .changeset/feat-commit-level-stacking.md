---
"@better-commit/cli": minor
---

Add support for intra-PR commit-level stacking:

- Introduce the `stacking` plugin to automatically generate and inject stable `Change-Id` footers into commits.
- Add `bc stack` command to view the local commit stack, positions, and Change-Ids.
- Add `bc amend <target>` command to stage changes into intermediate commits using a headless Git autosquash rebase.
- Validate `Change-Id` existence in commit messages under CI check mode.
