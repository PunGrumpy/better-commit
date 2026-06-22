import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    "packages/design-system/components/ui",
    "packages/design-system/components/kibo-ui",
    "CHANGELOG.md",
  ],
});
