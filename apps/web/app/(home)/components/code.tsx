"use client";

import { CopyButton } from "@repo/design-system/components/copy-button";
import type { BundledLanguage } from "@repo/design-system/components/kibo-ui/code-block";
import {
  CodeBlockFilename,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockItem,
  CodeBlockHeader,
  CodeBlockFiles,
} from "@repo/design-system/components/kibo-ui/code-block";

const code = [
  {
    code: `npx @better-commit/cli`,
    filename: "Better Commit CLI",
    language: "bash",
  },
];

export const Code = () => (
  <CodeBlock data={code} defaultValue={code[0].language} className="h-fit">
    <CodeBlockHeader>
      <CodeBlockFiles>
        {(item) => (
          <CodeBlockFilename key={item.language} value={item.language}>
            {item.filename}
          </CodeBlockFilename>
        )}
      </CodeBlockFiles>
      <CopyButton text={code[0].code} />
    </CodeBlockHeader>
    <CodeBlockBody>
      {(item) => (
        <CodeBlockItem
          key={item.language}
          lineNumbers={false}
          value={item.language}
        >
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
