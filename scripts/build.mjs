import { checkBuild } from "./check-build.mjs";
import { cp, readFile, appendFile } from "node:fs/promises";
import { build } from "vite";
import { buildFonts } from "./fonts.mjs";

const root = new URL("../", import.meta.url);
await buildFonts();
await build();
await appendFile(
  new URL("dist/assets/third-party.txt", root),
  "\n## Colord upstream notice\n\n" +
    (await readFile(new URL("licenses/colord-MIT.txt", root), "utf8")),
);
const destination = new URL("dist/", root);
for (const name of ["LICENSE", "NOTICE", "robots.txt"])
  await cp(new URL(name, root), new URL(name, destination));
for (const name of ["qiuhong-OFL.txt", "wenkai-OFL.txt"]) {
  await cp(
    new URL(`src/assets/fonts/${name}`, root),
    new URL(`assets/${name}`, destination),
  );
}
await checkBuild(destination);
console.log(
  "Built the public website without source or deployment configuration.",
);
