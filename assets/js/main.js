import { createJourney } from "./motion/journey.js";
import { drawStaticCity } from "./city/painting.js";
import { createScene, drawStaticScene } from "./scene.js";
import { createRenderer } from "./rendering/renderer.js";

let canvas = document.getElementById("landscape");
let renderer = createRenderer(canvas),
  context,
  painting;
const button = document.getElementById("motion");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let paused = false,
  lost = false,
  frame = 0,
  last = 0,
  time = 0,
  resizeTimer;
const journey = createJourney(innerWidth / innerHeight < 0.85 ? 0.64 : 0.69);
let shownScene = "";
const sceneButtons = [...document.querySelectorAll("[data-scene]")];
let dimensions = "";
let touch = [0, 0, -100];
function fallback() {
  renderer?.dispose();
  renderer = null;
  const replacement = canvas.cloneNode(false);
  canvas.replaceWith(replacement);
  canvas = replacement;
  context = canvas.getContext("2d");
  canvas.dataset.renderer = "canvas2d";
  if (painting) {
    if (journey.state().scene === "city")
      drawStaticCity(context, painting.city, painting.layers.boat);
    else drawStaticScene(context, painting);
  }
  button.hidden = true;
}

function draw() {
  if (lost || !painting) return;
  const state = journey.state();
  if (renderer) renderer.draw(time, touch, state);
  else if (state.scene === "city")
    drawStaticCity(context, painting.city, painting.layers.boat);
  else drawStaticScene(context, painting);
  updateSceneUI(state);
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
function tick(now) {
  frame = 0;
  if (paused || lost || document.hidden || !renderer) return;
  if (!last || now - last >= 1000 / 24) {
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    time += dt;
    journey.advance(dt);
    last = now;
    draw();
  }
  frame = requestAnimationFrame(tick);
}
function sync() {
  cancelAnimationFrame(frame);
  frame = 0;
  last = 0;
  button.textContent = paused ? "云起" : "静观";
  button.title = paused ? "恢复旅程与动态" : "暂停旅程与动态";
  button.setAttribute("aria-label", button.title);
  button.setAttribute("aria-pressed", String(paused));
  if (!paused && !lost && !document.hidden && renderer)
    frame = requestAnimationFrame(tick);
}
function updateSceneUI(state) {
  canvas.dataset.scene = state.scene;
  canvas.dataset.transition = String(state.transitioning);
  const inscription = document.querySelector(".inscription");
  inscription.style.opacity = state.transitioning
    ? String(Math.abs(state.blend * 2 - 1))
    : "1";
  if (shownScene === state.scene) return;
  shownScene = state.scene;
  document.body.dataset.view = state.scene;
  const city = state.scene === "city";
  document.querySelector("h1").textContent = city ? "京华入夜" : "山静日长";
  document.querySelector(".inscription p").innerHTML = city
    ? "亮马浮灯影<br />一舟渡古今"
    : "一水含天远<br />千山入梦深";
  document.querySelector(".seal").innerHTML = city
    ? "京<br />华"
    : "山<br />居";
  document.querySelector(".work-mark").textContent = city
    ? "亮马河畔　·　灯火可亲"
    : "山水无尽　·　心自闲";
  canvas.setAttribute(
    "aria-label",
    city
      ? "北京亮马河入夜，沿岸树影、步道与桥灯映入水中，一舟向右驶去，再循雾回到山水。"
      : "层山隐于云间，淡日映天，近岸松石，一舟浮于江上，游鱼点水。",
  );
  for (const button of sceneButtons)
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.scene === state.scene),
    );
}
for (const control of sceneButtons)
  control.addEventListener("click", () => {
    journey.select(control.dataset.scene, paused || !renderer);
    draw();
    document.getElementById("status").textContent =
      control.dataset.scene === "city" ? "驶入北京。" : "回望山水。";
  });
if (!renderer) fallback();
button.hidden = !renderer;
button.addEventListener("click", () => {
  paused = !paused;
  sync();
  document.getElementById("status").textContent = paused
    ? "旅程暂歇，静观此刻。"
    : "继续行舟。";
});
reduced.addEventListener("change", () => {
  paused = reduced.matches;
  sync();
});
document.addEventListener("visibilitychange", sync);
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 120);
});
canvas.addEventListener("pointerdown", (event) => {
  if (paused || reduced.matches) return;
  touch = [event.clientX / innerWidth, event.clientY / innerHeight, time];
  draw();
});
canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  lost = true;
  canvas.dataset.renderer = "webgl-lost";
  cancelAnimationFrame(frame);
});
canvas.addEventListener("webglcontextrestored", () => {
  lost = false;
  try {
    renderer.restore();
    dimensions = "";
    resize();
    sync();
  } catch (error) {
    console.warn("Restoring the ink canvas.", error);
    fallback();
    draw();
  }
});
resize();
sync();
