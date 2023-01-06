import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["cjs", "es"],
    },
    rollupOptions: {
      external: ["solid-js"],
    },
  },
});