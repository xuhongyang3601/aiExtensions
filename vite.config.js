import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  build: {
    watch: {
      include: "src/**",
      exclude: "node_modules/**",
    },
    outDir: "dist",
    rollupOptions: {
      input: {
        background: resolve(__dirname, "background.js"),
        content: resolve(__dirname, "content.js"),
        sidepanel: resolve(__dirname, "src/index.html"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
        paths: (id) => "./" + id.split("/").pop(),
      },
    },
  },
  base: "./",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
