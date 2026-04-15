import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: { sortImports: {}, sortPackageJson: {} },
  lint: { options: { typeAware: true, typeCheck: true } },
  pack: {
    sourcemap: true,
  },
  resolve: {
    conditions: ["browser"],
  },
});
