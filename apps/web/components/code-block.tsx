"use client";

import { cn } from "@repo/design-system/lib/utils";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { createContext, use } from "react";

import { CopyButton } from "@/components/copy-button";

const CodeCopyContext = createContext("");

const CodeBlockActions = ({ className }: { className?: string }) => {
  const code = use(CodeCopyContext);

  return (
    <div
      className={cn(
        className,
        "rounded-sm bg-background/90 p-0.5 text-muted-foreground shadow-none backdrop-blur-none"
      )}
    >
      <CopyButton onCopy={() => navigator.clipboard.writeText(code)} />
    </div>
  );
};

interface CodeBlockProps {
  code: string;
  lang: string;
}

export const CodeBlock = ({ lang, code }: CodeBlockProps) => (
  <CodeCopyContext value={code}>
    <DynamicCodeBlock
      code={code}
      codeblock={{
        Actions: CodeBlockActions,
        allowCopy: false,
        className: cn(
          "my-0 border-0 bg-background shadow-none rounded-xl",
          "outline outline-1 outline-offset-[-1px] outline-black/10 dark:outline-white/10"
        ),
        viewportProps: {
          className: cn(
            "font-mono [font-feature-settings:'liga'_0,'calt'_0] font-variant-ligatures-none"
          ),
        },
      }}
      lang={lang}
    />
  </CodeCopyContext>
);
