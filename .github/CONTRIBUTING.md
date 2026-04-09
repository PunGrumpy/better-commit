# Contributing to better-commit

Thanks for your interest in contributing. **better-commit** is a TypeScript-first CLI for conventional commits (`commit.config.ts`, plugins, optional AI, and `bc check` for CI). This repository is a **monorepo** (Turborepo): the published npm package lives under `packages/cli`; `apps/web` and `packages/design-system` support the marketing site and shared UI.

## Source code

The repository is hosted at [PunGrumpy/better-commit](https://github.com/PunGrumpy/better-commit).

## Getting started

1. Fork the repository on GitHub.
2. Clone your fork: `git clone https://github.com/PunGrumpy/better-commit.git`
3. Install dependencies: `bun install`
4. Create a branch: `git checkout -b feature/your-feature-name`
5. Make your changes.
6. From the repo root, run:
   - Tests: `bun run test`
   - Typecheck: `bun run check-types`
   - Lint: `bun run lint`
   - Format: `bun run format`
   - Build: `bun run build`
7. Commit with clear messages.
8. Push to your fork and open a Pull Request.

CLI-focused work is usually done in `packages/cli`. See **[packages/cli/README.md](../packages/cli/README.md)** for install, `commit.config.ts`, providers, hooks, and CI usage.

## Changesets

We use [Changesets](https://github.com/changesets/changesets) for versioning and changelogs of the **`better-commit`** npm package. Release automation ignores `web` and `@repo/design-system`; only changes that should ship on npm need a changeset.

1. Run `bun run changeset` at the repo root.
2. Pick the bump: `patch` / `minor` / `major`.
3. Describe the change (this text appears in the changelog).
4. Commit the new file under `.changeset/` with your work.

**Add a changeset when** your change affects the published CLI (user-visible behavior, public API, or anything that should appear in release notes).

**You can skip a changeset when** you only touch `apps/web` or `packages/design-system`, or for internal refactors/tests/docs that do not affect the published package (see [`.changeset/config.json`](../.changeset/config.json) `ignore` list for packages excluded from versioning).

## Pull request guidelines

- Tie the PR to an issue or explain the motivation clearly.
- Keep changes focused; match existing style and patterns.
- Add or update tests when behavior in `packages/cli` changes.
- Include a changeset when the published CLI should be released.
- Ensure checks you rely on pass locally (`bun run test`, `bun run check-types`, `bun run lint`).

## Development commands (root)

| Command | Description |
| -------- | ----------- |
| `bun run dev` | Run `dev` across the workspace via Turborepo |
| `bun run build` | Build all packages/apps |
| `bun run test` | Run tests via Turborepo |
| `bun run check-types` | Typecheck across the workspace |
| `bun run lint` | `ultracite check` |
| `bun run format` | `ultracite fix` |
| `bun run changeset` | Create a changeset file |

For local CLI iteration only: `cd packages/cli` and use `bun run dev` (watch build) or `bun run test`.

## Issues and discussions

- **Bugs:** [Issues](https://github.com/PunGrumpy/better-commit/issues) — search first, then file with steps to reproduce when possible.
- **Ideas / questions:** GitHub [Discussions](https://github.com/PunGrumpy/better-commit/discussions) or an issue, whichever fits best.

## Code of conduct

This project follows the Code of Conduct in **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)**. By participating, you agree to uphold it.

Thank you for contributing.
