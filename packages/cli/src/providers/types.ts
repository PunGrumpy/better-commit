export interface GenerateMessageContext {
  customPrompt?: string;
  existingMessage?: string;
  preferredAgent?: string | null;
  scope?: string;
  type?: string;
}

export interface AIProvider {
  name: string;
  generateMessage(
    diff: string,
    context: GenerateMessageContext
  ): Promise<string>;
}
