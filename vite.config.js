import path from "path";
import { defineConfig } from "vite";

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["cjs", "es"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["solid-js"],
    },
  },
});
