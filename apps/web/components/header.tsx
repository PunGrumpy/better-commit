import Link from "fumadocs-core/link";

import { docsRoute, gitConfig } from "@/lib/shared";

export const Header = () => (
  <nav className="flex items-center justify-between px-4 sm:px-8 lg:px-12">
    <span className="text-sm tracking-tight uppercase">Better Commit</span>
    <div className="flex items-center gap-5">
      <Link
        href={docsRoute}
        className="text-sm text-foreground/40 hover:text-foreground transition-colors"
      >
        Docs
      </Link>
      <Link
        href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
        external
        className="text-sm text-foreground/40 hover:text-foreground transition-colors"
        prefetch={false}
      >
        GitHub
      </Link>
    </div>
  </nav>
);
