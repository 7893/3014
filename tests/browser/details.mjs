import assert from "node:assert/strict";

export async function checkDetails(browser, url) {
  for (const width of [960, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.goto(`${url}/__test/blank.html`);
    const result = await page.evaluate(async () => {
      const { createScene, createRenderer, createPierVisitor, roomLayout } = await import("/__test/harness.js");
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
      const actor = createPierVisitor(), coast = painting.get("coast").layers.foreground;
      const ctx = coast.getContext("2d"); let dryContacts = 0;
      actor.update(0); const initial = Array.from(actor.feet);
      actor.update(.9); const movement = actor.feet.reduce((n, v, i) => n + Math.abs(v - initial[i]), 0);
      for (let t = 0; t < 7.2; t += .15) {
        actor.update(t);
        for (let foot = 0; foot < 2; foot++) {
          const px = actor.feet[foot * 2] * coast.width, py = actor.feet[foot * 2 + 1] * coast.height;
          if (ctx.getImageData(Math.floor(px), Math.floor(py), 1, 1).data[3] > 64) dryContacts++;
        }
      }
      actor.dispose(); actor.root.destroy({ children: true });
      const error = gl.getError(); renderer.dispose();
      return { skyChanges, wrapChanges, movement, dryContacts, error };
    });
    assert(result.skyChanges.every(count => count > 50), JSON.stringify(result));
    assert(result.wrapChanges.every(change => change < .2), "Clouds must wrap outside the window");
    assert(result.movement > .001, JSON.stringify(result));
    assert.equal(result.dryContacts, 0, "Feet must remain over open water throughout the motion");
    assert.equal(result.error, 0);
    console.log(`Window animation and moving water contact (${width}):`, result);
    await page.close();
  }
}
