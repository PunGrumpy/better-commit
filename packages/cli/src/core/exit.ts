export const exitSuccess = (): never => {
  process.exit(0);
};

export const exitFailure = (message?: string): never => {
  if (message) {
    console.error(message);
  }
  process.exit(1);
};
