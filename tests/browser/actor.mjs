import assert from "node:assert/strict";

export async function checkActor(browser, url) {
  const page = await browser.newPage();
  try {
    await page.goto(url + "/__test/blank.html");
    const result = await page.evaluate(async () => {
      const {
        createBoat,
        boat,
        createGeometry,
        createPass,
        WebGLRenderer,
        Ticker,
      } = await import("/__test/harness.js");
      Ticker.system.autoStart = false;
      Ticker.system.stop();
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 100;
      const renderer = new WebGLRenderer();
      await renderer.init({
        canvas,
        width: 160,
        height: 100,
        manageImports: false,
      });
      const actor = createBoat(),
        geometry = createGeometry();
      const pass = createPass(
        `#version 300 es
        precision highp float;
        in vec2 v_uv; out vec4 outColor;
        uniform sampler2D u_boatLayer;
        uniform vec2 u_boatCenter,u_actorScale;
        ${boat}
        void main(){vec4 m=boatMasks(vec2(v_uv.x,1.-v_uv.y));outColor=vec4(m.r,m.a,0.,1.);}`,
        {
          u_boatCenter: { value: [0.5, 0.5], type: "vec2<f32>" },
          u_actorScale: { value: [1 / 160, 1 / 100], type: "vec2<f32>" },
        },
        { u_boatLayer: actor.texture.source },
        geometry,
      );
      const gl = canvas.getContext("webgl2");
      function frame(time, passenger = false) {
        actor.draw(renderer, time, passenger);
        renderer.render({ container: pass.mesh, clear: true });
        const pixels = new Uint8Array(160 * 100 * 4);
        gl.readPixels(0, 0, 160, 100, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        return pixels;
      }
      function peak(pixels, top) {
        let max = 0;
        for (let y = top; y < top + 5; y++)
          for (let x = 91; x < 97; x++)
            max = Math.max(max, pixels[((99 - y) * 160 + x) * 4 + 1]);
        return max;
      }
      const first = frame(0),
        next = frame(Math.PI / 3.5),
        repeated = frame((2 * Math.PI) / 1.75);
      const difference = (a, b) =>
        a.reduce((n, v, i) => n + Math.abs(v - b[i]), 0);
      const result = {
        head: peak(first, 38),
        below: peak(first, 58),
        movement: difference(first, next),
        loop: difference(first, repeated),
        companion: difference(first, frame(0, true)),
        restored: difference(first, frame(0)),
        error: gl.getError(),
      };
      pass.dispose();
      geometry.destroy();
      actor.dispose();
      renderer.destroy(false);
      return result;
    });
    assert(result.head > 150, "the head must remain above the hull");
    assert(result.below < 110, "actor texture must not be vertically inverted");
    assert(result.movement > 100, "rowing parts must move");
    assert(result.loop < 100, "rowing must loop without a visible jump");
    assert(result.companion > 100, "courtyard must add a seated passenger");
    assert.equal(result.restored, 0, "passenger must not persist in other scenes");
    assert.equal(result.error, 0);
    console.log("Actor orientation, rowing and loop passed:", result);
  } finally {
    await page.close();
  }
}
