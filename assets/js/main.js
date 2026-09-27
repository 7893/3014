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
  if (painting) drawStaticScene(context, painting);
  button.hidden = true;
}
if (!renderer) fallback();
function draw() {
  if (lost || !painting) return;
  if (renderer) renderer.draw(time, touch);
  else drawStaticScene(context, painting);
}
function resize() {
  if (lost) return;
  const w = innerWidth,
    h = innerHeight;
  const limit = renderer?.maxSize || 4096;
  const dpr = Math.min(
    devicePixelRatio || 1,
    1.5,
    Math.sqrt((w / h < 0.85 ? 850000 : 1800000) / (w * h)),
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
    time += last ? Math.min((now - last) / 1000, 0.1) : 0;
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
  button.title = paused ? "恢复云水流动" : "暂停云水流动";
  button.setAttribute("aria-label", button.title);
  button.setAttribute("aria-pressed", String(paused));
  if (!paused && !lost && !document.hidden && renderer)
    frame = requestAnimationFrame(tick);
}
button.hidden = !renderer;
button.addEventListener("click", () => {
  paused = !paused;
  sync();
  document.getElementById("status").textContent = paused
    ? "云水暂歇，静观山色。"
    : "云行水动。";
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
