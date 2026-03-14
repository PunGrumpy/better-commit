import { Anthropic } from "@anthropic-ai/sdk";

import { getCommitPrompt, buildUserPrompt } from "../prompts/commit-prompt.js";
import type { AIProvider, GenerateMessageContext } from "./types.js";

export const createAnthropicProvider = (): AIProvider | null => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return null;
  }

  const client = new Anthropic({ apiKey: key });

  return {
    async generateMessage(diff: string, context: GenerateMessageContext) {
      const systemPrompt = getCommitPrompt(context.customPrompt);
      const userPrompt = buildUserPrompt(diff, context);
      const { content } = await client.messages.create({
        max_tokens: 100,
        messages: [{ content: userPrompt, role: "user" }],
        model: "claude-3-5-haiku-20241022",
        system: systemPrompt,
      });
      const text = content
        .filter((c) => c.type === "text")
        .map((c) => ("text" in c ? c.text : ""))
        .join("")
        .trim();
      return text || "feat: update";
    },
    name: "anthropic",
  };
};
