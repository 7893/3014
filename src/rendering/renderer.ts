import { createGeometry } from "./pass.ts";
import { Ticker, WebGLRenderer } from "pixi.js";
import { createEnvironment } from "../environment/state.ts";
import { definitions } from "../scenes/registry.ts";
import type { Scene, SceneName, JourneyState } from "../scenes/types.ts";
import { createResources } from "./resources.ts";
import { createTargets } from "./targets.ts";
import { createCompositor } from "./compositor.ts";

export async function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  // Pixi maintenance shares the application clock, including hidden-tab pauses.
  Ticker.system.autoStart = false;
  Ticker.system.stop();
  const renderer = new WebGLRenderer();
  try {
    await renderer.init({
      canvas,
      context: gl,
      width: canvas.width,
      height: canvas.height,
      resolution: 1,
      autoDensity: false,
      antialias: false,
      backgroundAlpha: 1,
      clearBeforeRender: true,
      manageImports: false,
    });
  } catch (error) {
    console.warn("Using static scenes.", error);
    renderer.destroy(false);
    return null;
  }
  const environment = createEnvironment();
  const geometry = createGeometry();
  const resources = createResources(geometry);
  const targets = createTargets();
  const compositor = createCompositor(targets.textures, geometry);
  let scene: Scene;
  canvas.dataset.renderer = "webgl2";
  function upload(next: Scene) {
    scene = next;
    renderer.resize(next.width, next.height);
    resources.upload(next);
    targets.resize(next.width, next.height);
  }
  function drawScene(
    key: SceneName,
    slot: number,
    time: number,
    touch: number[],
    x: number,
    wind: ArrayLike<number>,
  ) {
    const pass = resources.prepare(key);
    const conditions = environment.sample(key, time, wind);
    const W = scene.portrait ? 760 : 1600;
    const H = (W * scene.height) / scene.width;
    const scale = scene.portrait ? 1.35 : 1.6;
    Object.assign(pass.uniforms.uniforms, {
      u_size: [scene.width, scene.height],
      u_time: time,
      u_touch: touch,
      u_wind: conditions.wind,
      u_environment: conditions.atmosphere,
      u_boatCenter: scene.boatCenter,
      u_boat: [x - scene.boatCenter[0], Math.sin(time * 1.05) * 0.0022],
      u_actorScale: [scale / W, scale / H],
    });
    definitions[key].update?.(pass.uniforms.uniforms, canvas, time);
    renderer.render({
      container: pass.mesh,
      target: targets.textures[slot],
      clear: true,
    });
  }
  return {
    upload,
    draw(
      time: number,
      touch: number[],
      journey: JourneyState,
      wind: ArrayLike<number> = [0, 0, time, 0.65],
    ) {
      Ticker.system.update(performance.now());
      drawScene(
        journey.from,
        0,
        time,
        touch,
        journey.positions[journey.from]!,
        wind,
      );
      if (journey.transitioning)
        drawScene(
          journey.to,
          1,
          time,
          touch,
          journey.positions[journey.to]!,
          wind,
        );
      compositor.draw(renderer, time, journey);
    },
    setEnvironment: environment.setTarget,
    resetEnvironment: environment.reset,
    dispose() {
      resources.dispose();
      compositor.dispose();
      targets.dispose();
      geometry.destroy();
      renderer.destroy(false);
    },
    // Pixi restores programs and GPU allocations; upload rebuilds scene sources.
    restore() {
      canvas.dataset.renderer = "webgl2";
    },
    prepare: resources.prepare,
    get preparedScenes() {
      return resources.preparedScenes;
    },
    maxSize: Math.min(
      gl.getParameter(gl.MAX_TEXTURE_SIZE),
      gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    ),
  };
}
export type ArtRenderer = NonNullable<
  Awaited<ReturnType<typeof createRenderer>>
>;
