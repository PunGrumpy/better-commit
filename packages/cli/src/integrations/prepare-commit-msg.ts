export const PREPARE_COMMIT_MSG_SCRIPT = `# better-commit: interactive commit message for git commit

# Skip when bc is completing its own git commit
[ -n "$BETTER_COMMIT_SKIP_HOOK" ] && exit 0

# Skip merge/squash commits (Git passes source as $2)
[ "$2" = "merge" ] || [ "$2" = "squash" ] && exit 0

# Avoid opening editor after hook writes message
export GIT_EDITOR=cat

# Reattach TTY for clack prompts when a controlling terminal is available
if sh -c 'exec 0</dev/tty' 2>/dev/null; then
  exec bc commit --hook "$1" < /dev/tty > /dev/tty 2>&1
fi
exec bc commit --hook "$1"
`;
