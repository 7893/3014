import assert from "node:assert/strict";

export async function checkDetails(browser, url) {
  for (const width of [960, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.goto(`${url}/__test/blank.html`);
    const result = await page.evaluate(async () => {
      const { createScene, createRenderer, createRunningChild, BEACH_RUN, roomLayout } = await import("/__test/harness.js");
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
      let directions = 0;
      for (const index of [0, 1]) {
        const actor = createRunningChild(index);
        for (let phase = .1; phase < Math.PI * 4; phase += .11) {
          const time = (phase + index * BEACH_RUN.lag) / BEACH_RUN.speed;
          actor.update(time);
          const body = actor.root.getChildByLabel("runner-body");
          const nose = actor.root.getChildByLabel("runner-nose", true);
          const velocity = Math.cos(phase);
          const face = nose.toGlobal({ x: 0, y: 0 }).x - nose.parent.toGlobal({ x: 0, y: 0 }).x;
          if (face * velocity <= 0 || body.scale.x * velocity <= 0 || Math.abs(body.scale.x) !== 1)
            throw new Error("Runner pose faces against travel or flattens during a turn");
          directions++;
        }
        actor.dispose(); actor.root.destroy({ children: true });
      }
      const error = gl.getError(); renderer.dispose();
      return { skyChanges, wrapChanges, directions, error };
    });
    assert(result.skyChanges.every(count => count > 50), JSON.stringify(result));
    assert(result.wrapChanges.every(change => change < .2), "Clouds must wrap outside the window");
    assert(result.directions > 200);
    assert.equal(result.error, 0);
    console.log(`Window animation and runner direction (${width}):`, result);
    await page.close();
  }
}
