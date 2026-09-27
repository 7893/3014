import { createAnimation } from "./app/animation.js";
import { initializeCopy, updateSceneUI } from "./app/interface.js";
import { arrivalText } from "./config/copy.js";
import { createWind } from "./motion/wind.js";
import { createJourney, scenes } from "./motion/journey.js";
import { createScene } from "./scenes/index.js";
import { createPreparation } from "./app/preparation.js";
import { createRenderer } from "./rendering/renderer.js";

let canvas = document.getElementById("landscape");
let renderer = createRenderer(canvas),
  context,
  painting;
let lost = false,
  time = 0,
  resizeTimer;
const journey = createJourney(innerWidth / innerHeight < 0.85 ? 0.64 : 0.69);
const sceneButtons = [...document.querySelectorAll("[data-scene]")];
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
  advance: (dt) => {
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
  preparation.stop();
  renderer?.dispose();
  renderer = null;
  const replacement = canvas.cloneNode(false);
  canvas.replaceWith(replacement);
  canvas = replacement;
  context = canvas.getContext("2d");
  canvas.dataset.renderer = "canvas2d";
  if (painting) drawStatic(journey.state().scene);
}

function drawStatic(name) {
  painting.drawStatic(name, context);
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
  preparation.stop();
  const w = innerWidth,
    h = innerHeight;
  const limit = renderer?.maxSize || 4096;
  const dpr = Math.min(
    devicePixelRatio || 1,
    1.5,
    Math.sqrt(1800000 / (w * h)),
    limit / w,
    limit / h,
  );
  const width = Math.max(1, Math.round(w * dpr)),
    height = Math.max(1, Math.round(h * dpr));
  const key = width + ":" + height;
  if (key === dimensions && painting) return;
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
      scenes.filter((name) => !renderer.preparedScenes.includes(name)),
    );
}
for (const control of sceneButtons)
  control.addEventListener("click", () => {
    journey.select(control.dataset.scene, !renderer);
    draw();
    document.getElementById("status").textContent = arrivalText(
      control.dataset.scene,
    );
  });
if (!renderer) fallback();
document.addEventListener("visibilitychange", () => {
  animation.sync();
  if (document.hidden || !renderer || lost) preparation.stop();
  else
    preparation.start(
      scenes.filter((name) => !renderer.preparedScenes.includes(name)),
    );
});
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 120);
});
document.querySelector("main").addEventListener("pointerdown", (event) => {
  if (event.target !== canvas) return;
  touch = [event.clientX / innerWidth, event.clientY / innerHeight, time];
  draw();
});
canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  lost = true;
  canvas.dataset.renderer = "webgl-lost";
  animation.stop();
  preparation.stop();
});
canvas.addEventListener("webglcontextrestored", () => {
  lost = false;
  try {
    renderer.restore();
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
