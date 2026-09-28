import type { SceneName, Painting } from "./types.ts";
import { definitions } from "./registry.ts";
import { canvasLayer } from "../drawing/canvas.ts";
import { createBrush } from "../drawing/brush.ts";
import { paintBoat } from "../drawing/boat.ts";

export function createScene(width: number, height: number) {
  const portrait = width / height < 0.85;
  const W = portrait ? 760 : 1600,
    H = (W * height) / width;
  const boatCenter = [portrait ? 0.64 : 0.69, portrait ? 0.815 : 0.805];
  const staticBoats = new Map<boolean, HTMLCanvasElement>();
  const cache = new Map<SceneName, Painting>();
  function get(name: SceneName) {
    if (!definitions[name]) throw new Error(`Unknown scene: ${name}`);
    if (!cache.has(name))
      cache.set(name, definitions[name].create(width, height));
    return cache.get(name)!;
  }
  return {
    width,
    height,
    portrait,
    boatCenter,
    get,
    get preparedScenes() {
      return [...cache.keys()];
    },
    drawStatic(name: SceneName, context: CanvasRenderingContext2D) {
      const passenger = name === "garden";
      if (!staticBoats.has(passenger)) {
        const layer = canvasLayer(width, height, W);
        paintBoat(
          createBrush(layer.ctx, 707),
          W * boatCenter[0],
          H * boatCenter[1],
          portrait ? 1.35 : 1.6,
          true,
          passenger,
        );
        staticBoats.set(passenger, layer.canvas);
      }
      definitions[name].drawStatic(context, get(name), staticBoats.get(passenger)!);
    },
  };
}
