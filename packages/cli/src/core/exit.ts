export const exitSuccess = (): never => {
  process.exit(0);
};

export const exitFailure = (message?: string): never => {
  if (message) {
    console.error(message);
  }
  process.exit(1);
};

export const exitCancel = (): never =>
  process.env.BETTER_COMMIT_HOOK_MODE === "1" ? exitFailure() : exitSuccess();
