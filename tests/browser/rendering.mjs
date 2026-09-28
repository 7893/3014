import assert from "node:assert/strict";

export async function checkRendering(page) {
  const result = await page.evaluate(async () => {
    const { createScene } = await import("/__test/harness.js");
    const { createRenderer } = await import("/__test/harness.js");
    const canvas = document.createElement("canvas");
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const painting = createScene(canvas.width, canvas.height);
    const renderer = await createRenderer(canvas),
      gl = canvas.getContext("webgl2");
    let programs = 0;
    const createProgram = gl.createProgram.bind(gl);
    gl.createProgram = () => {
      programs++;
      return createProgram();
    };
    renderer.upload(painting);
    const initial = [
      painting.preparedScenes.length,
      renderer.preparedScenes.length,
    ];
    function frame(scene, time, touch = [0, 0, -100]) {
      renderer.draw(time, touch, {
        scene,
        from: scene,
        to: scene,
        blend: 0,
        transitioning: false,
        positions: { [scene]: 0.69 },
      });
      const pixels = new Uint8Array(canvas.width * canvas.height * 4);
      gl.readPixels(
        0,
        0,
        canvas.width,
        canvas.height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels,
      );
      return pixels;
    }
    const results = [];
    for (const scene of ["ink", "city", "coast", "garden"]) {
      const first = frame(scene, 0),
        baseline = frame(scene, 3);
      if (scene === "coast") {
        let covered = 0,
          columns = 0;
        for (
          let x = Math.floor(canvas.width * 0.51);
          x < canvas.width * 0.63;
          x++
        ) {
          let foam = false;
          for (
            let y = Math.floor(canvas.height * 0.96);
            y < canvas.height;
            y++
          ) {
            const i = ((canvas.height - 1 - y) * canvas.width + x) * 4;
            if (baseline[i] > 165 && baseline[i + 1] > 195) foam = true;
          }
          columns++;
          if (foam) covered++;
        }
        if (covered / columns < 0.85)
          throw new Error(
            `Central surf has a gap: ${covered}/${columns} columns`,
          );
      }
      const clicked = frame(scene, 3, [0.5, 0.82, 2]);
      let changed = 0,
        mass = 0,
        mx = 0,
        my = 0;
      for (let y = 0; y < canvas.height; y++)
        for (let x = 0; x < canvas.width; x++) {
          const i = ((canvas.height - 1 - y) * canvas.width + x) * 4;
          if (Math.abs(first[i] - baseline[i]) > 8) changed++;
          const w =
            Math.abs(clicked[i] - baseline[i]) +
            Math.abs(clicked[i + 1] - baseline[i + 1]) +
            Math.abs(clicked[i + 2] - baseline[i + 2]);
          mass += w;
          mx += w * (x - canvas.width * 0.5) ** 2;
          my += w * (y - canvas.height * 0.82) ** 2;
        }
      results.push({
        scene,
        changed,
        mass,
        ratio: Math.sqrt(mx / my),
        prepared: renderer.preparedScenes.length,
      });
    }
    const compiledBeforeResize = programs;
    const resized = createScene(canvas.width, canvas.height);
    renderer.upload(resized);
    const reset = [
      resized.preparedScenes.length,
      renderer.preparedScenes.length,
    ];
    frame("city", 3);
    const restoredCount = renderer.preparedScenes.length,
      error = gl.getError();
    renderer.dispose();
    return {
      initial,
      results,
      reset,
      restoredCount,
      error,
      compiledBeforeResize,
      programs,
    };
  });
  assert.deepEqual(
    result.initial,
    [0, 0],
    "startup must not paint or upload unused scenes",
  );
  assert.deepEqual(
    result.reset,
    [0, 0],
    "resize must release previous scene textures",
  );
  assert.equal(result.restoredCount, 1);
  assert.equal(
    result.programs,
    result.compiledBeforeResize,
    "resize must reuse compiled scene programs",
  );
  assert.equal(result.error, 0);
  result.results.forEach((scene, i) => {
    assert.equal(scene.prepared, i + 1);
    assert(scene.changed > 100, `${scene.scene} must animate`);
    assert(
      scene.mass > 0 && scene.ratio > 1.7,
      `${scene.scene} needs perspective ripples`,
    );
  });
  console.log(
    "Lazy resources, motion and perspective ripples:",
    result.results,
  );
}
