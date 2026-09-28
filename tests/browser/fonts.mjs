import assert from "node:assert/strict";

export async function checkFonts(page) {
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    [...document.fonts].map(({ family, status }) => ({ family, status })),
  );
  assert.equal(loaded.length, 2);
  assert.ok(loaded.every((font) => font.status === "loaded"));
  const client = await page.context().newCDPSession(page);
  try {
    await client.send("DOM.enable");
    await client.send("CSS.enable");
    const { root } = await client.send("DOM.getDocument");
    for (const selector of ["h1", ".inscription p", ".signature"]) {
      const { nodeId } = await client.send("DOM.querySelector", {
        nodeId: root.nodeId, selector,
      });
      const { fonts } = await client.send("CSS.getPlatformFontsForNode", { nodeId });
      assert.ok(fonts.some((font) => font.isCustomFont && font.glyphCount > 0), selector);
      assert.ok(fonts.every((font) => font.isCustomFont || font.glyphCount === 0), selector);
    }
  } finally {
    await client.detach();
  }
}
