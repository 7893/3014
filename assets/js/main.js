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
  if (painting) drawStatic(journey.state().scene);
}

function drawStatic(name) {
  if (name === "city")
    drawStaticCity(context, painting.city, painting.layers.boat);
  else if (name === "coast")
    drawStaticCoast(context, painting.coast, painting.layers.boat);
  else drawStaticScene(context, painting);
}
const descriptions = {
  ink: {
    title: "山静日长",
    poem: "一水含天远<br />千山入梦深",
    seal: "山<br />居",
    mark: "隐居山水　·　心自闲",
    description: "层山隐于云间，淡日映天，近岸松石，一舟浮于江上，游鱼点水。",
    arrival: "舟入山水，隐居。",
  },
  city: {
    title: "京华入夜",
    poem: "亮马浮灯影<br />一舟渡古今",
    seal: "京<br />华",
    mark: "都市灯火　·　亮马河畔",
    description: "北京亮马河入夜，沿岸树影、步道与桥灯映入水中，一舟向右驶去。",
    arrival: "舟入亮马河，都市。",
  },
  coast: {
    title: "椰风海韵",
    poem: "椰影摇晴日<br />一舟入海风",
    seal: "海<br />南",
    mark: "海岛度假　·　风暖潮轻",
    description:
      "海南意境的海湾，椰影摇曳，阳光洒落青绿浅海，细浪涌向沙岸，一舟随波前行。",
    arrival: "舟入海南海湾，度假。",
  },
};
function draw() {
  if (lost || !painting) return;
  const state = journey.state();
  if (renderer) renderer.draw(time, touch, state);
  else drawStatic(state.scene);
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
  if (lost || document.hidden || !renderer) return;
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
  if (!lost && !document.hidden && renderer)
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
  const info = descriptions[state.scene];
  document.querySelector("h1").textContent = info.title;
  document.querySelector(".inscription p").innerHTML = info.poem;
  document.querySelector(".seal").innerHTML = info.seal;
  document.querySelector(".work-mark").textContent = info.mark;
  canvas.setAttribute("aria-label", info.description);
  for (const button of sceneButtons)
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.scene === state.scene),
    );
}
for (const control of sceneButtons)
  control.addEventListener("click", () => {
    journey.select(control.dataset.scene, !renderer);
    draw();
    document.getElementById("status").textContent =
      descriptions[control.dataset.scene].arrival;
  });
if (!renderer) fallback();
document.addEventListener("visibilitychange", sync);
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
