import { defineConfig } from "vite";
import { renderCopy } from "./scripts/html.mjs";

export default defineConfig({
  publicDir: false,
  plugins: [
    {
      name: "artwork-copy",
      transformIndexHtml: { order: "pre", handler: (html) => renderCopy(html) },
    },
  ],
  build: {
    target: "es2022",
    sourcemap: false,
    assetsInlineLimit: 0,
    license: { fileName: "assets/third-party.txt" },
  },
});
