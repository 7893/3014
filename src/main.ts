import { viewportSize } from "./app/viewport.ts";
import { element } from "./app/dom.ts";
import type { SceneButton } from "./app/dom.ts";
import type { Scene, SceneName } from "./scenes/types.ts";
import { createAnimation } from "./app/animation.ts";
import { initializeCopy, updateSceneUI } from "./app/interface.ts";
import { arrivalText } from "./config/copy.ts";
import { createWind } from "./motion/wind.ts";
import { createJourney, scenes } from "./motion/journey.ts";
import { createScene } from "./scenes/index.ts";
import { createPreparation } from "./app/preparation.ts";
import { createRenderer } from "./rendering/renderer.ts";
import { hitWater } from "./scenes/water-hit.ts";

let canvas = element<HTMLCanvasElement>("#landscape");
let renderer = await createRenderer(canvas).catch((error: unknown) => {
    console.warn("Using static scenes.", error);
    return null;
  }),
  context: CanvasRenderingContext2D | null = null,
  painting: Scene | undefined;
let lost = false,
  time = 0,
  resizeTimer: number | undefined;
const journey = createJourney(innerWidth / innerHeight < 0.85 ? 0.64 : 0.69);
const sceneButtons = [
  ...document.querySelectorAll<SceneButton>("[data-scene]"),
];
initializeCopy(sceneButtons);
let dimensions = "";
let touch = [0, 0, -100];
const wind = createWind();
const preparation = createPreparation((name) => {
  if (!renderer || lost) return;
  try {
    renderer.prepare(name);
  } catch (error) {
    console.warn("Deferring scene preparation.", error);
  }
});
const animation = createAnimation({
  active: () => !lost && !document.hidden && !!renderer,
  advance: (dt: number) => {
    time += dt;
    journey.advance(dt);
    wind.advance(dt);
  },
  draw,
  onRate: (fps) => {
    canvas.dataset.targetFps = String(fps);
  },
});

function fallback() {
  animation.stop();
  preparation.stop();
  renderer?.dispose();
  renderer = null;
  const replacement = canvas.cloneNode(false) as HTMLCanvasElement;
  canvas.replaceWith(replacement);
  canvas = replacement;
  context = canvas.getContext("2d");
  canvas.dataset.renderer = "canvas2d";
  if (painting) drawStatic(journey.state().scene);
}

function drawStatic(name: SceneName) {
  if (painting && context) painting.drawStatic(name, context);
}
function draw() {
  if (lost || !painting) return;
  const state = journey.state();
  try {
    if (renderer) renderer.draw(time, touch, state, wind.value);
    else drawStatic(state.scene);
  } catch (error) {
    console.warn("Using static scene.", error);
    fallback();
  }
  updateSceneUI(canvas, state, sceneButtons);
}
function resize() {
  if (lost) return;
  const { width, height, key } = viewportSize(renderer?.maxSize);
  if (key === dimensions && painting) return;
  preparation.stop();
  dimensions = key;
  canvas.width = width;
  canvas.height = height;
  painting = createScene(width, height);
  if (renderer) {
    try {
      renderer.upload(painting);
    } catch (error) {
      console.warn("Using static ink layers.", error);
      fallback();
    }
  }
  draw();
  canvas.dataset.ready = "true";
  if (renderer)
    preparation.start(
      scenes.filter((name) => !renderer!.preparedScenes.includes(name)),
    );
}
for (const control of sceneButtons)
  control.addEventListener("click", () => {
    journey.select(control.dataset.scene, !renderer);
    draw();
    element("#status").textContent = arrivalText(control.dataset.scene);
  });
if (!renderer) fallback();
function sync() {
  animation.sync();
  if (document.hidden || !renderer || lost) preparation.stop();
  else
    preparation.start(
      scenes.filter((name) => !renderer!.preparedScenes.includes(name)),
    );
}
document.addEventListener("visibilitychange", sync);
window.addEventListener("pagehide", () => {
  clearTimeout(resizeTimer);
  animation.stop();
  preparation.stop();
});
window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  resize();
  sync();
});
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 120);
});
element("main").addEventListener("pointerdown", (event) => {
  if (event.target !== canvas || !painting) return;
  const state = journey.state();
  const x = event.clientX / innerWidth,
    y = event.clientY / innerHeight;
  if (state.transitioning || !hitWater(painting, state.scene, x, y)) return;
  touch = [x, y, time];
  draw();
});
canvas.addEventListener("webglcontextlost", (event) => {
  if (event.target !== canvas || !renderer) return;
  event.preventDefault();
  lost = true;
  canvas.dataset.renderer = "webgl-lost";
  animation.stop();
  preparation.stop();
});
canvas.addEventListener("webglcontextrestored", () => {
  lost = false;
  try {
    renderer?.restore();
    dimensions = "";
    resize();
    animation.sync();
  } catch (error) {
    console.warn("Restoring the ink canvas.", error);
    fallback();
    draw();
  }
});
resize();
animation.sync();
