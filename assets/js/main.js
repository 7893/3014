import { createAnimation } from "./app/animation.js";
import { descriptions, updateSceneUI } from "./app/interface.js";
import { createWind } from "./motion/wind.js";
import { drawStaticCoast } from "./coast/painting.js";
import { createJourney } from "./motion/journey.js";
import { drawStaticCity } from "./city/painting.js";
import { createScene, drawStaticScene } from "./scene.js";
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
let dimensions = "";
let touch = [0, 0, -100];
const wind = createWind();
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
  if (name === "city")
    drawStaticCity(context, painting.city, painting.layers.boat);
  else if (name === "coast")
    drawStaticCoast(context, painting.coast, painting.layers.boat);
  else drawStaticScene(context, painting);
}
function draw() {
  if (lost || !painting) return;
  const state = journey.state();
  if (renderer) renderer.draw(time, touch, state, wind.value);
  else drawStatic(state.scene);
  updateSceneUI(canvas, state, sceneButtons);
}
function resize() {
  if (lost) return;
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
}
for (const control of sceneButtons)
  control.addEventListener("click", () => {
    journey.select(control.dataset.scene, !renderer);
    draw();
    document.getElementById("status").textContent =
      descriptions[control.dataset.scene].arrival;
  });
if (!renderer) fallback();
document.addEventListener("visibilitychange", animation.sync);
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 120);
});
canvas.addEventListener("pointerdown", (event) => {
  touch = [event.clientX / innerWidth, event.clientY / innerHeight, time];
  draw();
});
canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  lost = true;
  canvas.dataset.renderer = "webgl-lost";
  animation.stop();
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
