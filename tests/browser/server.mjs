import { buildHarness } from "./build.mjs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

export async function serve() {
  await buildHarness();
  const testRoot = fileURLToPath(
    new URL("../../.cache/browser/", import.meta.url),
  );
  const root = fileURLToPath(new URL("../../dist/", import.meta.url));
  const mime = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".woff2": "font/woff2",
  };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      if (pathname === "/__test/blank.html") {
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end("<!doctype html><title>Rendering test</title>");
        return;
      }
      const base = pathname.startsWith("/__test/") ? testRoot : root;
      const requested = base === testRoot ? pathname.slice(7) : pathname;
      const path = resolve(
        base,
        "." + (requested === "/" ? "/index.html" : requested),
      );
      if (!path.startsWith(base.replace(/\/$/, "") + sep))
        throw new Error("Invalid path");
      const body = await readFile(path);
      response.writeHead(200, {
        "Content-Type": mime[extname(path)] || "text/plain",
      });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
