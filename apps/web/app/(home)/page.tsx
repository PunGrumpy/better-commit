import { Button } from "@repo/design-system/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { Installer } from "@/components/installer";

const title = "Better Commit";
const description = "Every commit, vetted before it reaches your repository";

export const metadata: Metadata = {
  description,
  openGraph: {
    description,
    title,
  },
  title,
  twitter: {
    card: "summary_large_image",
    description,
    title,
  },
};

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
    <h1 className="text-pretty text-2xl font-semibold">
      Every commit, vetted before it reaches your repository
    </h1>
    <div className="flex flex-col sm:flex-row w-full max-w-2xl items-stretch sm:items-center gap-4 justify-center">
      <Installer command="npx better-commit/cli" className="w-full sm:w-48" />
      <Button
        nativeButton={false}
        size="lg"
        render={<Link href="/docs" />}
        className="w-full sm:w-auto"
      >
        Read docs
      </Button>
    </div>
    <div className="w-full text-pretty text-muted-foreground text-sm">
      Configure <code>commit.config.ts</code> before your commits are served.
    </div>
    <div className="w-full">
      <CodeBlock lang="typescript" code={code} />
    </div>
  </div>
);

export default HomePage;
