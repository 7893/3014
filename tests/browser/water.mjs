import assert from "node:assert/strict";

export async function checkWaterInteraction(page) {
  const results = await page.evaluate(async () => {
    const { createScene } = await import("/assets/js/scenes/index.js");
    const { createRenderer } = await import("/assets/js/rendering/renderer.js");
    const { hitWater } = await import("/assets/js/scenes/water-hit.js");
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const painting = createScene(800, 600), renderer = createRenderer(canvas);
    const gl = canvas.getContext("webgl2");
    renderer.upload(painting);
    function frame(scene, touch) {
      renderer.draw(3, touch, {
        from: scene, to: scene, blend: 0, transitioning: false,
        positions: { [scene]: 0.69 },
      }, [0, 0, 0, 0]);
      const pixels = new Uint8Array(800 * 600 * 4);
      gl.readPixels(0, 0, 800, 600, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      return pixels;
    }
    const difference = (a, b) => a.reduce((sum, n, i) => sum + Math.abs(n - b[i]), 0);
    const results = [];
    try {
      for (const scene of ["ink", "city", "coast"]) {
        const baseline = frame(scene, [0, 0, -100]);
        const layers = painting.get(scene).layers;
        const land = layers[scene === "ink" ? "shore" : scene === "city" ? "bank" : "foreground"];
        const pixels = land.getContext("2d").getImageData(0, 0, 800, 600).data;
        let solid;
        for (let y = 510; y < 599 && !solid; y++)
          for (let x = 0; x < 200; x++)
            if (pixels[(y * 800 + x) * 4 + 3] > 110) {
              solid = [(x + 0.5) / 800, (y + 0.5) / 600];
              break;
            }
        if (!solid) throw new Error(`Missing foreground fixture: ${scene}`);
        const wet = [0.5, 0.82];
        const waterFrame = frame(scene, [...wet, 2]);
        let hidden = 0;
        // Opaque ground must cover the expanding ring, not merely reject its source.
        const crossing = frame(scene, [0.30, 0.86, 1]);
        for (let y = 0; y < 600; y++)
          for (let x = 0; x < 800; x++) {
            const alpha = pixels[(y * 800 + x) * 4 + 3];
            if (scene === "ink" ? alpha < 120 : alpha !== 255) continue;
            const i = ((599 - y) * 800 + x) * 4;
            for (let c = 0; c < 3; c++) hidden += Math.abs(crossing[i + c] - baseline[i + c]);
          }
        results.push({
          scene,
          skyAccepted: hitWater(painting, scene, 0.5, 0.2),
          groundAccepted: hitWater(painting, scene, ...solid),
          waterAccepted: hitWater(painting, scene, ...wet),
          skyDifference: difference(baseline, frame(scene, [0.5, 0.2, 2])),
          groundDifference: difference(baseline, frame(scene, [...solid, 2])),
          waterDifference: difference(baseline, waterFrame),
          hiddenDifference: hidden,
        });
      }
      return results;
    } finally { renderer.dispose(); }
  });
  for (const result of results) {
    assert.equal(result.skyAccepted, false, result.scene);
    assert.equal(result.groundAccepted, false, result.scene);
    assert.equal(result.waterAccepted, true, result.scene);
    assert.equal(result.skyDifference, 0, result.scene);
    assert.equal(result.groundDifference, 0, result.scene);
    assert(result.waterDifference > 0, result.scene);
    assert.equal(result.hiddenDifference, 0, `${result.scene} foreground must occlude ripples`);
  }
  console.log("Water-only clicks and foreground occlusion passed:", results);
}
