import { checkActor } from "./actor.mjs";
import { checkPasses } from "./passes.mjs";
import { checkSoak } from "./soak.mjs";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { serve } from "./server.mjs";
import { checkCopy, checkFallback } from "./interface.mjs";
import { checkRendering } from "./rendering.mjs";
import { checkLifecycle } from "./lifecycle.mjs";
import { checkFonts } from "./fonts.mjs";
import { checkWaterInteraction } from "./water.mjs";
import { copy } from "../../src/config/copy.ts";

const server = await serve();
let browser;
try {
  browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
  await checkActor(browser, server.url);
  await checkPasses(browser, server.url);
  await checkSoak(browser, server.url);
  await checkLifecycle(browser, server.url);
  for (const viewport of [
    { width: 960, height: 640 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport }),
      errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      Math.random = () => 0.9;
    });
    await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
    await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
    await page.goto(server.url);
    await page.waitForSelector('canvas[data-ready="true"]');
    assert.equal(
      await page.locator("canvas").getAttribute("data-renderer"),
      "webgl2",
    );
    async function advance(ms) {
      // Advance the real application clock without rendering thousands of frames.
      await page.evaluate(() => {
        window.savedDraw = WebGL2RenderingContext.prototype.drawArrays;
        window.savedElements = WebGL2RenderingContext.prototype.drawElements;
        WebGL2RenderingContext.prototype.drawElements =
          WebGL2RenderingContext.prototype.drawArrays = function () {};
      });
      await page.clock.runFor(ms);
      await page.evaluate(() => {
        WebGL2RenderingContext.prototype.drawArrays = window.savedDraw;
        WebGL2RenderingContext.prototype.drawElements = window.savedElements;
      });
      await page.clock.runFor(100);
    }
    for (const [key, info] of Object.entries(copy.scenes)) {
      await page.getByRole("button", { name: info.label, exact: true }).click();
      await advance(6000);
      await checkCopy(page, key);
      await checkFonts(page);
    }
    await advance(61000);
    assert.notEqual(
      await page.locator("canvas").getAttribute("data-scene"),
      "garden",
    );
    const scene = await page.locator("canvas").getAttribute("data-scene");
    await page.evaluate(() => {
      window.loss = document
        .querySelector("canvas")
        .getContext("webgl2")
        .getExtension("WEBGL_lose_context");
      window.loss.loseContext();
    });
    await page.clock.runFor(100);
    await page.evaluate(() => window.loss.restoreContext());
    await page.clock.runFor(500);
    assert.equal(
      await page.locator("canvas").getAttribute("data-renderer"),
      "webgl2",
    );
    await checkCopy(page, scene);
    assert.equal(
      await page
        .locator("canvas")
        .evaluate((c) => c.getContext("webgl2").getError()),
      0,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await checkRendering(page);
    if (viewport.width === 960) await checkWaterInteraction(page);
    assert.deepEqual(errors, []);
    await page.close();
  }
  await checkFallback(browser, server.url);
  console.log(
    "Desktop, mobile, transitions, recovery and static fallback passed.",
  );
} finally {
  await browser?.close();
  await server.close();
}
