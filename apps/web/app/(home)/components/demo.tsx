"use client";

import { CopyButton } from "@repo/design-system/components/copy-button";
import type { BundledLanguage } from "@repo/design-system/components/kibo-ui/code-block";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockFiles,
  CodeBlockFilename,
  CodeBlockSelect,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockBody,
  CodeBlockItem,
  CodeBlockContent,
} from "@repo/design-system/components/kibo-ui/code-block";

const code = [
  {
    code: `export default defineConfig({
  plugins: [
    conventionalCommits({
      types: [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "perf",
        "ci",
        "build",
      ],
    }),
    aiSuggest({ provider: "auto" }),
  ],
});`,
    filename: "commit.config.ts",
    language: "ts",
  },
];

export const Demo = () => (
  <CodeBlock data={code} defaultValue={code[0].language} className="h-fit">
    <CodeBlockHeader>
      <CodeBlockFiles>
        {(item) => (
          <CodeBlockFilename key={item.language} value={item.language}>
            {item.filename}
          </CodeBlockFilename>
        )}
      </CodeBlockFiles>
      <CodeBlockSelect>
        <CodeBlockSelectContent>
          {(item) => (
            <CodeBlockSelectItem key={item.language} value={item.language}>
              {item.language}
            </CodeBlockSelectItem>
          )}
        </CodeBlockSelectContent>
      </CodeBlockSelect>
      <CopyButton text={code[0].code} />
    </CodeBlockHeader>
    <CodeBlockBody>
      {(item) => (
        <CodeBlockItem key={item.language} value={item.language}>
          <CodeBlockContent
            themes={{ dark: "vesper", light: "github-light" }}
            language={item.language as BundledLanguage}
          >
            {item.code}
          </CodeBlockContent>
        </CodeBlockItem>
      )}
    </CodeBlockBody>
  </CodeBlock>
);
