import assert from "node:assert/strict";
import { copy } from "../../src/config/copy.ts";

export async function checkRoom(browser, url) {
  for (const width of [960, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(() => { Math.random = () => .9; });
    await page.clock.install(); await page.clock.pauseAt(new Date());
    await page.goto(url); await page.waitForSelector('canvas[data-ready="true"]');
    async function advance() {
      await page.evaluate(() => {
        window.drawA = WebGL2RenderingContext.prototype.drawArrays;
        window.drawE = WebGL2RenderingContext.prototype.drawElements;
        WebGL2RenderingContext.prototype.drawArrays = WebGL2RenderingContext.prototype.drawElements = function () {};
      });
      await page.clock.runFor(5500);
      await page.evaluate(() => {
        WebGL2RenderingContext.prototype.drawArrays = window.drawA;
        WebGL2RenderingContext.prototype.drawElements = window.drawE;
      });
      await page.clock.runFor(100);
    }
    for (const scene of ["ink", "coast"]) {
      await page.getByRole("button", { name: copy.scenes[scene].label, exact: true }).click();
      await advance();
      const entry = page.getByRole("button", { name: copy.hidden.enter, exact: true });
      assert(await entry.isVisible());
      const bounds = await entry.boundingBox();
      await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      await advance();
      assert.equal(await page.locator("canvas").getAttribute("data-scene"), "room");
      assert.equal(await page.locator(".scene-nav").isVisible(), false);
      assert.equal(await page.locator("#sun-entry").isVisible(), false);
      await page.clock.fastForward(90000);
      assert.equal(await page.locator("canvas").getAttribute("data-scene"), "room");
      if (scene === "ink") await page.keyboard.press("Escape");
      else await page.getByRole("button", { name: copy.hidden.back, exact: true }).click();
      await advance();
      assert.equal(await page.locator("canvas").getAttribute("data-scene"), scene);
      assert(await page.locator(".scene-nav").isVisible());
      assert.equal(await page.locator("#room-return").isVisible(), false);
      assert(await page.locator("#sun-entry").evaluate(node => node === document.activeElement));
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Hidden entry, held scene, menu visibility, return and focus passed.");
}
