import { definitions } from "./registry.js";
import { canvasLayer } from "../drawing/canvas.js";
import { createBrush } from "../drawing/brush.js";
import { paintBoat } from "../drawing/boat.js";

export function createScene(width, height) {
  const portrait = width / height < 0.85;
  const W = portrait ? 760 : 1600,
    H = (W * height) / width;
  const boatCenter = [portrait ? 0.64 : 0.69, portrait ? 0.815 : 0.805];
  const { canvas: boat, ctx } = canvasLayer(width, height, W);
  paintBoat(
    createBrush(ctx, 707),
    W * boatCenter[0],
    H * boatCenter[1],
    portrait ? 1.35 : 1.6,
  );
  const cache = new Map();
  function get(name) {
    if (!definitions[name]) throw new Error(`Unknown scene: ${name}`);
    if (!cache.has(name))
      cache.set(name, definitions[name].create(width, height));
    return cache.get(name);
  }
  return {
    width,
    height,
    portrait,
    boatCenter,
    boat,
    get,
    get preparedScenes() {
      return [...cache.keys()];
    },
    drawStatic(name, context) {
      definitions[name].drawStatic(context, get(name), boat);
    },
  };
}
