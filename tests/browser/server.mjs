import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

export async function serve() {
  const root = fileURLToPath(new URL("../../dist/", import.meta.url));
  const mime = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
  };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      const path = resolve(
        root,
        "." + (pathname === "/" ? "/index.html" : pathname),
      );
      if (!path.startsWith(root.replace(/\/$/, "") + sep))
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
