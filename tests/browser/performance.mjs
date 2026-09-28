import { chromium } from "playwright";
import { mkdir, writeFile, readdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { serve } from "./server.mjs";

const label = process.argv[2] || "current";
if (!/^[a-z0-9-]+$/.test(label)) throw new Error("Invalid report label");
const directory = new URL("../../.cache/performance/", import.meta.url);
await mkdir(directory, { recursive: true });
const server = await serve();
const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.goto(server.url + "/__test/blank.html");
  const rendering = await page.evaluate(async () => {
    const { createScene, createRenderer } = await import("/__test/harness.js");
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 400;
    document.body.append(canvas);
    const renderer = await createRenderer(canvas);
    const gl = canvas.getContext("webgl2");
    let draws = 0,
      fullscreen = 0;
    for (const method of ["drawArrays", "drawElements"]) {
      const original = gl[method].bind(gl);
      gl[method] = (...args) => {
        draws++;
        const viewport = gl.getParameter(gl.VIEWPORT);
        if (viewport[2] === 640 && viewport[3] === 400) fullscreen++;
        return original(...args);
      };
    }
    const painting = createScene(640, 400);
    renderer.upload(painting);
    const result = [];
    for (const scene of ["ink", "city", "coast"]) {
      const state = {
        from: scene,
        to: scene,
        scene,
        transitioning: false,
        blend: 0,
        positions: { [scene]: 0.69 },
      };
      for (let i = 0; i < 3; i++) renderer.draw(3, [0, 0, -100], state);
      gl.finish();
      draws = fullscreen = 0;
      renderer.draw(3, [0, 0, -100], state);
      gl.finish();
      result.push({ scene, draws, fullscreen, error: gl.getError() });
    }
    renderer.dispose();
    return result;
  });
  await page.close();
  const live = await browser.newPage({ viewport: { width: 640, height: 400 } });
  await live.addInitScript(() => {
    Math.random = () => 0.9;
    window.longTasks = [];
    const ready = new MutationObserver(() => {
      if (document.querySelector('canvas[data-ready="true"]')) {
        window.readyAt = performance.now();
        ready.disconnect();
      }
    });
    ready.observe(document, {
      subtree: true,
      attributes: true,
      childList: true,
    });
    new PerformanceObserver((list) => {
      window.longTasks.push(...list.getEntries().map((e) => e.duration));
    }).observe({ type: "longtask", buffered: true });
  });
  await live.goto(server.url);
  await live.waitForSelector('canvas[data-ready="true"]');
  const startup = await live.evaluate(() => ({
    readyMs: window.readyAt,
    longTasks: window.longTasks,
    scripts: performance
      .getEntriesByType("resource")
      .filter((e) => e.name.endsWith(".js"))
      .map((e) => ({
        name: new URL(e.name).pathname,
        bytes: e.decodedBodySize,
      })),
  }));
  const assets = new URL("../../dist/assets/", import.meta.url);
  let javascript = 0,
    gzip = 0;
  for (const name of await readdir(assets)) {
    if (!name.endsWith(".js")) continue;
    const file = await readFile(new URL(name, assets));
    javascript += file.length;
    gzip += gzipSync(file).length;
  }
  const report = {
    label,
    rendering,
    startup,
    javascript,
    gzip,
    note: "Software Chromium; draw counts are exact, timing is not device FPS.",
  };
  await writeFile(
    new URL(`${label}.json`, directory),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await server.close();
}
