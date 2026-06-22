import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { title, github } from "./shared";

export const baseOptions = (): BaseLayoutProps => ({
  githubUrl: `https://github.com/${github.owner}/${github.repo}`,
  nav: {
    title,
  },
  themeSwitch: {
    mode: "light-dark-system",
  },
});
