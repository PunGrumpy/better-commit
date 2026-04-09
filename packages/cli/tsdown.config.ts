import { defineConfig } from "tsdown";

export default defineConfig({
  banner: { js: "#!/usr/bin/env node" },
  dts: true,
  entry: ["src/index.ts", "src/public-config.ts"],
  format: ["esm"],
  minify: true,
  outDir: "dist",
  sourcemap: false,
});
