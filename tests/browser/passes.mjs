import assert from "node:assert/strict";

export async function checkPasses(browser, url) {
  const page = await browser.newPage();
  try {
    await page.goto(url + "/__test/blank.html");
    const result = await page.evaluate(async () => {
      const { createScene, createRenderer } = await import(
        "/__test/harness.js"
      );
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 200;
      const renderer = await createRenderer(canvas);
      renderer.upload(createScene(canvas.width, canvas.height));
      const gl = canvas.getContext("webgl2");
      function frame(scene, transitioning) {
        renderer.draw(3, [0, 0, -100], {
          scene,
          from: scene,
          to: "ink",
          transitioning,
          blend: 0,
          positions: { [scene]: 0.69, ink: 0.69 },
        });
        const pixels = new Uint8Array(320 * 200 * 4);
        gl.readPixels(0, 0, 320, 200, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        return pixels;
      }
      const result = [];
      for (const scene of ["city", "coast"]) {
        const direct = frame(scene, false),
          composed = frame(scene, true);
        result.push({
          scene,
          difference: direct.reduce(
            (max, value, i) => Math.max(max, Math.abs(value - composed[i])),
            0,
          ),
        });
      }
      const error = gl.getError();
      renderer.dispose();
      return { result, error };
    });
    assert.equal(result.error, 0);
    for (const scene of result.result)
      assert(
        scene.difference <= 1,
        `${scene.scene}: direct output changes appearance`,
      );
    console.log("Direct and composed scene output agree:", result.result);
  } finally {
    await page.close();
  }
}
