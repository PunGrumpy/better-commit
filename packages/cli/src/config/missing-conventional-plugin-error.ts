export class MissingConventionalPluginError extends Error {
  public constructor() {
    super(
      "Missing required plugin: conventionalCommits(). Add conventionalCommits({ types: [...] }) to the plugins array in commit.config.ts."
    );
    this.name = "MissingConventionalPluginError";
  }
}
