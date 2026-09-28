import assert from "node:assert/strict";
import { chromium } from "playwright";
import { serve } from "./server.mjs";

// Real elapsed time, in addition to the accelerated resource stress in soak.mjs.
const duration = Number(process.env.ENDURANCE_SECONDS || 120);
if (!Number.isFinite(duration) || duration < 60 || duration > 86400)
  throw new Error("ENDURANCE_SECONDS must be between 60 and 86400");
const server = await serve();
const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({ viewport: { width: 384, height: 256 } });
  const client = await page.context().newCDPSession(page);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(server.url);
  await page.waitForSelector('canvas[data-ready="true"]');
  const samples = [],
    started = Date.now();
  const scenes = new Set();
  while (Date.now() - started < duration * 1000) {
    await new Promise((resolve) => setTimeout(resolve, 30000));
    await client.send("HeapProfiler.collectGarbage");
    const heap = await client.send("Runtime.getHeapUsage");
    const dom = await client.send("Memory.getDOMCounters");
    const scene = await page.locator("canvas").getAttribute("data-scene");
    scenes.add(scene);
    const sample = {
      seconds: Math.round((Date.now() - started) / 1000),
      heap: heap.usedSize,
      nodes: dom.nodes,
      listeners: dom.jsEventListeners,
      scene,
    };
    samples.push(sample);
    assert.equal(
      await page.locator("canvas").getAttribute("data-renderer"),
      "webgl2",
    );
    assert.equal(
      await page
        .locator("canvas")
        .evaluate((c) => c.getContext("webgl2").getError()),
      0,
    );
    assert.deepEqual(errors, []);
    console.log("Live endurance sample:", sample);
  }
  const baseline = samples[1];
  for (const sample of samples.slice(2)) {
    assert(
      sample.heap < baseline.heap + 4 * 1024 * 1024,
      "retained heap must stay bounded",
    );
    assert(
      sample.nodes <= baseline.nodes + 8,
      "canvas count must stay bounded",
    );
    assert(
      sample.listeners <= baseline.listeners + 4,
      "listener count must stay bounded",
    );
  }
  if (duration >= 120)
    assert(scenes.size > 1, "the live journey must keep advancing");
  console.log(`Real-time endurance passed (${duration} seconds).`);
  await client.detach();
} finally {
  await browser.close();
  await server.close();
}
