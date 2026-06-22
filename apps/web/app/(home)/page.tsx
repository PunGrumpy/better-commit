"use client";

import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { Installer } from "@/components/installer";

const code = `export default defineConfig({
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
});`;

const HomePage = () => (
  <div className="relative flex flex-col gap-6 items-center justify-center px-4 w-full max-w-lg mx-auto">
    <h1 className="text-2xl font-semibold">
      Every commit, vetted before it reaches your repository
    </h1>
    <div className="flex w-full max-w-2xl flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <Installer command="npx better-commit/cli@latest" />
      <Button nativeButton={false} size="lg" render={<Link href="/docs" />}>
        Read docs
      </Button>
    </div>
    <div className="w-full text-balance text-muted-foreground text-sm">
      Configure <code>commit.config.ts</code> before your commits are served.
    </div>
    <div className="w-full">
      <CodeBlock lang="typescript" code={code} />
    </div>
  </div>
);

export default HomePage;
