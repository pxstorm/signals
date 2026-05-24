import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [dts({ insertTypesEntry: true })],
  build: {
    outDir: "dist",
    lib: {
      entry: "src/index.ts",
      name: "signals",
    },
    minify: "terser",
    rollupOptions: {
      output: [
        {
          format: "es",
          entryFileNames: "signals.es.js",
          chunkFileNames: "[name].es.js",
        },
        {
          format: "umd",
          name: "signals",
          entryFileNames: "signals.umd.cjs",
          chunkFileNames: "[name].umd.cjs",
        },
      ],
    },
  },
  test: {
    environment: "jsdom",
    pool: 'threads',
  },
});
