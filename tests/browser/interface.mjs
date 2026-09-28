import assert from "node:assert/strict";
import { copy, arrivalText } from "../../src/config/copy.ts";

export async function checkCopy(page, key) {
  const info = copy.scenes[key];
  assert.equal(await page.title(), copy.site.title);
  assert.equal(await page.locator("h1").textContent(), info.title);
  assert.equal(
    await page.locator(".inscription p").textContent(),
    info.poem.join(""),
  );
  assert.equal(await page.locator(".seal").textContent(), info.seal.join(""));
  assert.equal(await page.locator(".work-mark").textContent(), info.mark);
  assert.equal(
    await page.locator("canvas").getAttribute("aria-label"),
    info.description,
  );
}

export async function checkFallback(browser, url) {
  const page = await browser.newPage();
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === "webgl2" ? null : get.call(this, type, ...args);
    };
  });
  await page.goto(url);
  await page.waitForSelector('canvas[data-ready="true"]');
  assert.equal(
    await page.locator("canvas").getAttribute("data-renderer"),
    "canvas2d",
  );
  for (const [key, info] of Object.entries(copy.scenes)) {
    await page.getByRole("button", { name: info.label, exact: true }).click();
    await checkCopy(page, key);
    assert.equal(await page.locator("#status").textContent(), arrivalText(key));
  }
  await page.close();
  const noScript = await browser.newPage({ javaScriptEnabled: false });
  await noScript.goto(url);
  assert.equal(
    (await noScript.locator("noscript").textContent()).trim(),
    copy.site.noScript,
  );
  await noScript.close();
}
