import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import fs from "fs";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8888,
    proxy: {
      "/devApi": {
        target: "http://172.18.0.66/dianda",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/devApi/, ""),
      },
    },
  },
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
        chunkFileNames: (chunkInfo) => {
          return chunkInfo.name.startsWith("_")
            ? `${chunkInfo.name.replace(/^_+/, "")}.js`
            : "js/[name].[hash].js";
        },
        assetFileNames: "assets/[name].[ext]",
        paths: () => "./",
      },
    },
    cssCodeSplit: true,
  },
  base: "./",
  css: {
    postcss: {
      plugins: [],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          ["@babel/plugin-proposal-decorators", { legacy: true }],
          ["@babel/plugin-proposal-class-properties", { loose: true }],
        ],
      },
    }),
    {
      name: "copy-manifest",
      closeBundle() {
        fs.copyFileSync("manifest.json", "dist/manifest.json");
      },
    },
  ],
});
