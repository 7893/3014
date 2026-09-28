import assert from "node:assert/strict";

export async function checkLifecycle(browser, url) {
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.clock.install();
    await page.clock.pauseAt(new Date());
    await page.addInitScript(() => {
      let id = 0;
      window.idleWork = new Map();
      window.requestIdleCallback = (callback) => {
        window.idleWork.set(++id, callback);
        return id;
      };
      window.cancelIdleCallback = (key) => window.idleWork.delete(key);
      window.drawCount = 0;
      // Exercise scheduling without spending GPU time on every fake clock tick.
      WebGL2RenderingContext.prototype.drawArrays = function () {
        window.drawCount++;
      };
    });
    await page.goto(url);
    await page.waitForSelector('canvas[data-ready="true"]');
    assert.equal(await page.evaluate(() => window.idleWork.size), 1);

    await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    await page.clock.runFor(150);
    assert.equal(
      await page.evaluate(() => window.idleWork.size),
      1,
      "an unchanged viewport must retain pending scene preparation",
    );

    await page.evaluate(() => {
      window.dispatchEvent(new Event("resize"));
      window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true }));
    });
    const pausedDraws = await page.evaluate(() => window.drawCount);
    await page.clock.runFor(500);
    assert.equal(await page.evaluate(() => window.drawCount), pausedDraws);
    assert.equal(await page.evaluate(() => window.idleWork.size), 0);

    await page.evaluate(() =>
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })),
    );
    await page.clock.runFor(100);
    assert((await page.evaluate(() => window.drawCount)) > pausedDraws);
    assert.equal(await page.evaluate(() => window.idleWork.size), 1);
    const prepared = await page.evaluate(() => {
      let callbacks = 0;
      while (window.idleWork.size && callbacks < 4) {
        const [key, callback] = window.idleWork.entries().next().value;
        window.idleWork.delete(key);
        callback();
        callbacks++;
      }
      return callbacks;
    });
    assert.equal(prepared, 2, "both remaining scenes prepare after restoration");
    assert.deepEqual(errors, []);
    console.log("Unchanged resize and page lifecycle scheduling passed.");
  } finally {
    await page.close();
  }
}
