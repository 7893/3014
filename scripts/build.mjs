import { cp, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { buildFonts } from "./fonts.mjs";

const root = new URL("../", import.meta.url);
const check = spawnSync(
  process.execPath,
  ["scripts/sync-copy.mjs", "--check"],
  { cwd: root, stdio: "inherit" },
);
if (check.status !== 0) process.exit(check.status || 1);
await buildFonts();
const destination = new URL("dist/", root);
await rm(destination, { recursive: true, force: true });
await mkdir(destination);
for (const name of ["index.html", "assets", "LICENSE", "NOTICE", ".nojekyll"])
  await cp(new URL(name, root), new URL(name, destination), {
    recursive: true,
  });
console.log("Prepared dist/ with public website files only.");
