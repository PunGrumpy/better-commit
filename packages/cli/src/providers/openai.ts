import { OpenAI } from "openai";

import { getCommitPrompt, buildUserPrompt } from "../prompts/commit-prompt.js";
import type { AIProvider, GenerateMessageContext } from "./types.js";

export const createOpenAIProvider = (): AIProvider | null => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return null;
  }

  const client = new OpenAI({ apiKey: key });

  return {
    async generateMessage(diff: string, context: GenerateMessageContext) {
      const systemPrompt = getCommitPrompt(context.customPrompt);
      const userPrompt = buildUserPrompt(diff, context);
      const { choices } = await client.chat.completions.create({
        max_tokens: 100,
        messages: [
          { content: systemPrompt, role: "system" },
          { content: userPrompt, role: "user" },
        ],
        model: "gpt-4o-mini",
      });
      const text = choices[0]?.message?.content?.trim();
      return text ?? "feat: update";
    },
    name: "openai",
  };
};
