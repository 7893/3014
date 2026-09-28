import type { Painting } from "../types.ts";
export function drawStaticGarden(ctx: CanvasRenderingContext2D, scene: Painting, boat: HTMLCanvasElement) {
  const { width: w, height: h, layers } = scene;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#efe6d2"); sky.addColorStop(.66, "#d8ddc9");
  sky.addColorStop(.67, "#8fa89a"); sky.addColorStop(1, "#526f64");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  ctx.drawImage(layers.buildings, 0, 0);
  ctx.save(); ctx.translate(0, h * 1.32); ctx.scale(1, -1);
  ctx.globalAlpha = .27; ctx.drawImage(layers.buildings, 0, 0); ctx.restore();
  ctx.drawImage(layers.buildings, 0, 0);
  ctx.drawImage(layers.foliage, 0, 0);
  ctx.drawImage(boat, 0, 0); ctx.drawImage(layers.bank, 0, 0);
}
