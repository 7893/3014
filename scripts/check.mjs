import { readdir, access, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("../", import.meta.url)));
function run(args) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
run(["scripts/sync-copy.mjs", "--check"]);
let count = 0;
for (const root of ["assets", "scripts", "tests"]) {
  for (const name of await readdir(root, { recursive: true })) {
    if (!/\.(m?js|css)$/.test(name)) continue;
    const path = resolve(root, name),
      source = await readFile(path, "utf8");
    if (source.trimEnd().split("\n").length > 180)
      throw new Error(`Review module size: ${path}`);
    if (!/\.m?js$/.test(name)) continue;
    run(["--check", path]);
    for (const match of source.matchAll(/from\s+["'](\.[^"']+)["']/g))
      await access(resolve(dirname(path), match[1]));
    count++;
  }
}
console.log(`Checked ${count} modules, local imports and module sizes.`);
