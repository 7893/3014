import { canvasLayer, stroke } from "../../drawing/canvas.ts";
import { roomLayout } from "./composition.ts";
import { paintCouple } from "./figures.ts";
import { paintWindow, paintCurtains } from "./window.ts";
import { paintFurniture } from "./furniture.ts";

export function createRoom(width: number, height: number) {
  const W = width / height < .85 ? 760 : 1600, H = W * height / width;
  const layout = roomLayout(W, H);
  const { window: win, couple, candle, floor } = layout;
  const layers: Record<string, HTMLCanvasElement> = {};
  const contexts: Record<string, CanvasRenderingContext2D> = {};
  for (const name of ["interior", "curtain", "figures"]) {
    const layer = canvasLayer(width, height, W);
    layers[name] = layer.canvas; contexts[name] = layer.ctx;
  }
  const c = contexts.interior;
  const wall = c.createLinearGradient(0, 0, W, H);
  wall.addColorStop(0, "#8c6e50"); wall.addColorStop(.5, "#79624e"); wall.addColorStop(1, "#483e36");
  c.fillStyle = wall; c.fillRect(0, 0, W, H);
  const pool = c.createRadialGradient(candle.x, candle.y - H * .2, 0, candle.x, candle.y, W * .8);
  pool.addColorStop(0, "#ffd79460"); pool.addColorStop(1, "transparent");
  c.fillStyle = pool; c.fillRect(0, 0, W, H);
  c.fillStyle = "#47372c"; c.fillRect(0, floor, W, H - floor);
  for (let i = 0; i < 12; i++) {
    stroke(c, [[W * .48, floor], [W * (i / 9 - .15), H]], "#c89c6e26", 1.4);
    const y = floor + (H - floor) * (i / 11) ** 1.8;
    stroke(c, [[0, y], [W, y]], "#d3a27618", 1);
  }
  // Timber framing gives the room depth without crowding the inscription.
  c.fillStyle = "#382a23"; c.fillRect(0, H * .09, W, H * .025);
  c.fillRect(W * .025, 0, W * .014, floor);
  stroke(c, [[0, floor], [W, floor]], "#ad86604d", 5);
  paintWindow(c, win);
  paintFurniture(c, W, H, layout);
  paintCouple(contexts.figures, couple.x, couple.y, couple.size);
  paintCurtains(contexts.curtain, win, floor);
  return { layers, width, height };
}
