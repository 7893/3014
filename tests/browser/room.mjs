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
      assert.equal(await entry.isVisible(), false);
      assert.equal(await page.locator('[data-scene="garden"]').isVisible(), false);
      assert.equal(await page.locator('.scene-nav button:visible').count(), 3);
      const portrait = width / 844 < .85;
      const x = scene === "coast" || portrait ? .32 : .72;
      const y = scene === "coast" ? .28 : portrait ? .12 : .205;
      await page.mouse.click(x * width, y * 844);
      await page.locator("#sun-entry").evaluate(button => button.click());
      await page.locator('[data-scene="garden"]').evaluate(button => button.click());
      await page.keyboard.press("Escape");
      await advance();
      assert.equal(await page.locator("canvas").getAttribute("data-scene"), scene);
      assert.equal(await page.locator("#room-return").isVisible(), false);
      assert(await page.locator(".scene-nav").isVisible());
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Hidden scenes have no public entry on desktop or mobile.");
}
