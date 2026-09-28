import assert from "node:assert/strict";

export async function checkDetails(browser, url) {
  for (const width of [960, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.goto(`${url}/__test/blank.html`);
    const result = await page.evaluate(async () => {
      const { createScene, createRenderer, createRunningChild, BEACH_RUN, createPierGeometry, roomLayout } = await import("/__test/harness.js");
      const painting = createScene(innerWidth, innerHeight), canvas = document.createElement("canvas");
      canvas.width = innerWidth; canvas.height = innerHeight;
      const renderer = await createRenderer(canvas), gl = canvas.getContext("webgl2");
      renderer.upload(painting);
      const W = innerWidth / innerHeight < .85 ? 760 : 1600;
      const win = roomLayout(W, W * innerHeight / innerWidth).window;
      const x = Math.ceil(win.x / W * innerWidth), y = Math.ceil(win.y / W * innerWidth);
      const w = Math.floor(win.width / W * innerWidth), h = Math.floor(win.height / W * innerWidth * .62);
      const frames = [];
      for (const time of [0, 6, 16, 4.999, 5.001, 38.332, 38.334]) {
        renderer.draw(time, [0, 0, -100], { scene: "room", from: "room", to: "room",
          transitioning: false, blend: 0, positions: { room: .5 } });
        const data = new Uint8Array(w * h * 4);
        gl.readPixels(x, innerHeight - y - h, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data);
        frames.push(data);
      }
      const skyChanges = frames.slice(1, 3).map(data => {
        let changed = 0;
        for (let i = 0; i < data.length; i += 4)
          if (Math.abs(data[i] - frames[0][i]) + Math.abs(data[i + 1] - frames[0][i + 1]) > 12) changed++;
        return changed;
      });
      const wrapChanges = [3, 5].map(index => {
        let change = 0;
        for (let i = 0; i < frames[index].length; i++) change += Math.abs(frames[index][i] - frames[index + 1][i]);
        return change / frames[index].length;
      });
      const pier = createPierGeometry(innerWidth, innerHeight);
      const p = pier.positions, n = pier.verticesX;
      const farWidth = Math.hypot(p[n * 4] - p[0], p[n * 4 + 1] - p[1]);
      const nearWidth = Math.hypot(p[(n * 3 - 1) * 2] - p[(n - 1) * 2],
        p[(n * 3 - 1) * 2 + 1] - p[(n - 1) * 2 + 1]);
      if (!p.every(Number.isFinite) || nearWidth <= farWidth || p[(n - 1) * 2] < innerWidth)
        throw new Error("Pier must widen toward shore and connect beyond the frame");
      for (let i = 1; i < n; i++)
        if (p[i * 2] <= p[(i - 1) * 2]) throw new Error("Folded pier geometry");
      pier.destroy();
      let directions = 0, planted = 0;
      for (const index of [0, 1]) {
        const actor = createRunningChild(index);
        for (let phase = .1; phase < Math.PI * 4; phase += .11) {
          const time = (phase + index * BEACH_RUN.lag) / BEACH_RUN.speed;
          actor.update(time, innerWidth, innerHeight);
          const velocity = Math.cos(phase), sprite = actor.sprite;
          if (sprite.scale.x * velocity <= 0 || Math.abs(sprite.scale.x) !== 1)
            throw new Error("Runner pose faces against travel or flattens during a turn");
          if (Math.abs(velocity) < .12 && sprite.currentFrame !== 32)
            throw new Error("Runner must settle on the ground before reversing");
          const before = sprite.currentFrame, scale = Math.max(.5, Math.min(innerWidth, innerHeight) / 850);
          const direction = sprite.scale.x;
          const origin = (BEACH_RUN.x + BEACH_RUN.range * Math.sin(phase)) * innerWidth;
          const foot = before < 12 ? origin + direction * actor.poses[before].footX * scale : null;
          actor.update(time + .02, innerWidth, innerHeight);
          const after = sprite.currentFrame;
          if (foot !== null && after < 12 && direction === sprite.scale.x) {
            const nextOrigin = (BEACH_RUN.x + BEACH_RUN.range * Math.sin(phase + .02 * BEACH_RUN.speed)) * innerWidth;
            const nextFoot = nextOrigin + direction * actor.poses[after].footX * scale;
            if (Math.abs(nextFoot - foot) > .76 * scale)
              throw new Error("Planted foot slides beyond a single animation-frame step");
            planted++;
          }
          directions++;
        }
        actor.dispose(); actor.root.destroy({ children: true });
      }
      const error = gl.getError(); renderer.dispose();
      return { skyChanges, wrapChanges, directions, planted, error };
    });
    assert(result.skyChanges.every(count => count > 50), JSON.stringify(result));
    assert(result.wrapChanges.every(change => change < .2), "Clouds must wrap outside the window");
    assert(result.directions > 200);
    assert(result.planted > 20);
    assert.equal(result.error, 0);
    console.log(`Window animation and runner direction (${width}):`, result);
    await page.close();
  }
}
