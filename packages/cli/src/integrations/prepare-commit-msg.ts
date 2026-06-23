export const PREPARE_COMMIT_MSG_SCRIPT = `# better-commit: interactive commit message for git commit

# Skip when better-commit is completing its own git commit
[ -n "$BETTER_COMMIT_SKIP_HOOK" ] && exit 0

# Skip in CI (e.g. changesets/action, GitHub Actions bots)
[ -n "$CI" ] && exit 0

# Skip merge/squash commits (Git passes source as $2)
[ "$2" = "merge" ] || [ "$2" = "squash" ] && exit 0

# Skip non-interactive commits (no TTY: git commit -m, automation, etc.)
if ! sh -c 'exec 0</dev/tty' 2>/dev/null; then
  exit 0
fi

# Avoid opening editor after hook writes message
export GIT_EDITOR=cat

# Resolve CLI: GNU bc (calculator) shadows "bc" on Linux — use better-commit
resolve_better_commit() {
  if command -v better-commit >/dev/null 2>&1; then
    command -v better-commit
    return 0
  fi
  hook_dir=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
  repo_root=$(CDPATH= cd -- "$hook_dir/.." && pwd)
  if [ -x "$repo_root/node_modules/.bin/better-commit" ]; then
    echo "$repo_root/node_modules/.bin/better-commit"
    return 0
  fi
  return 1
}

BC_CMD=$(resolve_better_commit) || exit 0

exec "$BC_CMD" commit --hook "$1" < /dev/tty > /dev/tty 2>&1
`;
