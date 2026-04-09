# better-commit

Monorepo for **better-commit**: a TypeScript-first CLI for conventional commits — one **`commit.config.ts`**, plugins (`conventionalCommits`, optional `aiSuggest`), and **`bc check`** for CI.

## Development

```bash
bun install
bun run build
```

The repo root includes a sample [`commit.config.ts`](commit.config.ts) (imports the CLI package via a relative path for local development). Published users import from **`better-commit/config`**.

## Packages

| Path                                               | Description                                                   |
| -------------------------------------------------- | ------------------------------------------------------------- |
| [`packages/cli`](packages/cli)                     | `bc` / `better-commit` CLI and `better-commit/config` exports |
| [`apps/web`](apps/web)                             | Web app (Turborepo)                                           |
| [`packages/design-system`](packages/design-system) | Shared UI                                                     |

## Docs

See **[packages/cli/README.md](packages/cli/README.md)** for install, `commit.config.ts` examples, providers, hooks, and CI usage.

## License

MIT
