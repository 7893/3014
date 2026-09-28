import { readdir, access, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { renderCopy } from "./html.mjs";

process.chdir(fileURLToPath(new URL("../", import.meta.url)));
function run(args) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
renderCopy(await readFile("index.html", "utf8"));
run(["node_modules/typescript/bin/tsc", "--noEmit"]);
let count = 0;
for (const root of ["src", "scripts", "tests"]) {
  for (const name of await readdir(root, { recursive: true })) {
    if (!/\.(m?js|ts|css)$/.test(name)) continue;
    const path = resolve(root, name),
      source = await readFile(path, "utf8");
    if (source.trimEnd().split("\n").length > 180)
      throw new Error(`Review module size: ${path}`);
    if (/\.css$/.test(name)) continue;
    if (/\.m?js$/.test(name)) run(["--check", path]);
    for (const match of source.matchAll(/from\s+["'](\.[^"']+)["']/g))
      await access(resolve(dirname(path), match[1]));
    count++;
  }
}
console.log(`Checked ${count} modules, local imports and module sizes.`);
