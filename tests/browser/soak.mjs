import assert from "node:assert/strict";

export async function checkSoak(browser, url) {
  const page = await browser.newPage();
  const client = await page.context().newCDPSession(page);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(url + "/__test/blank.html");
    await page.evaluate(async () => {
      const { createScene, createRenderer, createJourney } = await import(
        "/__test/harness.js"
      );
      const canvas = document.createElement("canvas");
      canvas.width = 192;
      canvas.height = 128;
      const live = {},
        gl = canvas.getContext("webgl2");
      for (const kind of [
        "Texture",
        "Buffer",
        "Framebuffer",
        "Program",
        "VertexArray",
      ]) {
        const set = new Set();
        live[kind] = set;
        for (const action of ["create", "delete"]) {
          const method = gl[action + kind].bind(gl);
          gl[action + kind] = (...args) => {
            const value = method(...args);
            if (action === "create" && value) set.add(value);
            else if (action === "delete") set.delete(args[0]);
            return value;
          };
        }
      }
      const renderer = await createRenderer(canvas);
      renderer.upload(createScene(canvas.width, canvas.height));
      const journey = createJourney(0.69, () => 0.9);
      let time = 0,
        cycles = 0;
      window.soak = {
        live,
        run() {
          // Simulate six hours per batch: animation seeks, interruption and resize.
          for (let tick = 0; tick < 21600; tick++) {
            time++;
            journey.advance(1);
            if (tick % 600 === 0) {
              const name = ["ink", "city", "coast"][cycles++ % 3];
              journey.select(name);
              journey.advance(2.5);
              renderer.draw(time, [0, 0, -100], journey.state());
              journey.select(["city", "coast", "ink"][cycles % 3]);
            }
          }
          for (let resize = 0; resize < 3; resize++) {
            canvas.width = resize % 2 ? 128 : 192;
            canvas.height = resize % 2 ? 192 : 128;
            renderer.upload(createScene(canvas.width, canvas.height));
            for (const name of ["ink", "city", "coast"]) {
              journey.select(name, true);
              renderer.draw(time, [0, 0, -100], journey.state());
            }
          }
          return {
            time,
            error: gl.getError(),
            live: Object.fromEntries(
              Object.entries(live).map(([k, v]) => [k, v.size]),
            ),
          };
        },
        dispose() {
          renderer.dispose();
          return {
            contextLost: gl.isContextLost(),
            textures: live.Texture.size,
            buffers: live.Buffer.size,
          };
        },
      };
    });
    const samples = [];
    for (let batch = 0; batch < 8; batch++) {
      const state = await page.evaluate(() => window.soak.run());
      await client.send("HeapProfiler.collectGarbage");
      const { usedSize } = await client.send("Runtime.getHeapUsage");
      const dom = await client.send("Memory.getDOMCounters");
      samples.push({
        ...state,
        heap: usedSize,
        nodes: dom.nodes,
        listeners: dom.jsEventListeners,
      });
      assert.equal(state.error, 0);
    }
    const warm = samples[2],
      last = samples.at(-1);
    for (const sample of samples.slice(3)) {
      assert.deepEqual(
        sample.live,
        warm.live,
        "GPU allocations must plateau across resize and transitions",
      );
      assert(
        sample.heap < warm.heap + 2 * 1024 * 1024,
        "retained JS heap must plateau after warmup",
      );
      assert(
        sample.nodes <= warm.nodes + 8,
        "discarded canvases must be collected",
      );
      assert(
        sample.listeners <= warm.listeners + 4,
        "listeners must not accumulate",
      );
    }
    const disposal = await page.evaluate(() => window.soak.dispose());
    assert.equal(
      disposal.contextLost,
      true,
      "renderer teardown releases its GPU context",
    );
    assert.equal(disposal.textures, 0);
    assert.equal(disposal.buffers, 0);
    assert.deepEqual(errors, []);
    console.log("48 simulated hours, 24 resizes, bounded retained resources:", {
      warm,
      last,
      disposal,
    });
  } finally {
    await client.detach();
    await page.close();
  }
}
