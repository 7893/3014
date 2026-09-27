import { readFile, writeFile } from "node:fs/promises";
import { copy } from "../assets/js/config/copy.js";

const template = await readFile(
  new URL("./page.html", import.meta.url),
  "utf8",
);
const output = new URL("../index.html", import.meta.url);
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
const html = template
  .replace(/\{\{ ([\w.]+) \}\}/g, (_, path) => {
    const value = path.split(".").reduce((part, key) => part?.[key], copy);
    if (typeof value !== "string" && !Array.isArray(value))
      throw new Error(`Missing copy: ${path}`);
    return Array.isArray(value)
      ? value.map(escape).join("<br />")
      : escape(value);
  })
  .replace(
    "<!doctype html>",
    "<!doctype html>\n<!-- Generated from scripts/page.html and assets/js/config/copy.js. Do not edit. -->",
  );

if (process.argv.includes("--check")) {
  if ((await readFile(output, "utf8")) !== html) {
    console.error("Static copy is stale. Run: node scripts/sync-copy.mjs");
    process.exitCode = 1;
  } else console.log("Static copy matches configuration.");
} else {
  await writeFile(output, html);
  console.log("Updated index.html from copy configuration.");
}
