import { spawnSync } from "node:child_process";
import { accessSync, constants } from "node:fs";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("../", import.meta.url)));
const values = Object.fromEntries(
  ["HOST", "USER", "KEY", "KNOWN_HOSTS"].map((name) => {
    const value = process.env[`DEPLOY_${name}`];
    if (!value || /[\r\n\0]/.test(value))
      throw new Error(`Missing or invalid DEPLOY_${name}`);
    return [name, value];
  }),
);
if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(values.HOST))
  throw new Error("Invalid deployment host");
if (!/^[a-z_][a-z0-9_-]*$/.test(values.USER))
  throw new Error("Invalid deployment user");
for (const path of [values.KEY, values.KNOWN_HOSTS])
  accessSync(path, constants.R_OK);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, options);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed`);
  return result.stdout;
}
const changes = run("git", ["status", "--porcelain"], { encoding: "utf8" });
if (changes.trim()) throw new Error("Commit changes before deploying");
run("git", ["verify-commit", "HEAD"], { stdio: "inherit" });
const archive = run(
  "tar",
  [
    "-cf",
    "-",
    "-C",
    "dist",
    "index.html",
    "assets",
    "LICENSE",
    "NOTICE",
    ".nojekyll",
  ],
  { maxBuffer: 20 * 1024 * 1024 },
);
run(
  "ssh",
  [
    "-F",
    "/dev/null",
    "-T",
    "-i",
    values.KEY,
    "-o",
    "IdentitiesOnly=yes",
    "-o",
    "BatchMode=yes",
    "-o",
    "StrictHostKeyChecking=yes",
    "-o",
    `UserKnownHostsFile=${values.KNOWN_HOSTS}`,
    "-o",
    "ConnectTimeout=15",
    `${values.USER}@${values.HOST}`,
  ],
  { input: archive, stdio: ["pipe", "inherit", "inherit"], timeout: 60000 },
);
