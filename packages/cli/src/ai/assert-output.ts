export const assertNonEmptyAiOutput = (
  text: string,
  provider: string
): string => {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error(`${provider} returned empty message`);
  }
  return trimmed;
};
