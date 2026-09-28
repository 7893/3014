import { build } from "vite";

export async function buildHarness() {
  await build({
    configFile: false,
    publicDir: false,
    logLevel: "warn",
    build: {
      outDir: ".cache/browser",
      target: "es2022",
      emptyOutDir: true,
      lib: {
        entry: "tests/browser/harness.mjs",
        formats: ["es"],
        fileName: () => "harness.js",
      },
    },
  });
}
