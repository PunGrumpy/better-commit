export class DuplicatePluginError extends Error {
  public readonly pluginId: string;

  public constructor(pluginId: string) {
    super(`Duplicate plugin id: "${pluginId}"`);
    this.name = "DuplicatePluginError";
    this.pluginId = pluginId;
  }
}
