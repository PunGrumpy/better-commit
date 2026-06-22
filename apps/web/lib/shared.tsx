import Link from "next/link";

export const docsRoute = "/docs";
export const docsImageRoute = "/og/docs";
export const docsContentRoute = "/llms.mdx/docs";

export const Logo = () => (
  <Link href="/">
    <span className="text-foreground text-lg leading-none">Better Commit</span>
  </Link>
);

export const github = {
  owner: "PunGrumpy",
  repo: "better-commit",
};

export const nav = [
  {
    href: "/docs",
    label: "Docs",
  },
  {
    href: `https://github.com/${github.owner}/${github.repo}`,
    label: "GitHub",
  },
];

export const title = "Better Commit Documentation";
