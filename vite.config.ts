import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: { sortImports: {}, sortPackageJson: {} },
  lint: { options: { typeAware: true, typeCheck: true } },
  pack: {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    outputOptions: (options, format) => ({
      ...options,
      entryFileNames: (chunk) =>
        chunk.name.endsWith(".d")
          ? `types/index.d.${format === "es" ? "ts" : "cts"}`
          : `solid-services.${format === "es" ? "js" : "cjs"}`,
    }),
    deps: {
      // rootless only exports an ESM entry; bundle it for CommonJS consumers.
      alwaysBundle: ["@solid-primitives/rootless"],
    },
    sourcemap: true,
  },
  resolve: {
    conditions: ["browser"],
  },
});
