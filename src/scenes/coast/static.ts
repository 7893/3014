import type { Painting } from "../types.ts";
export function drawStaticCoast(
  ctx: CanvasRenderingContext2D,
  coast: Painting,
  boatLayer: HTMLCanvasElement,
) {
  const { width: w, height: h } = coast;
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "#78b7c4");
  gradient.addColorStop(0.46, "#f7dfb1");
  gradient.addColorStop(0.461, "#3b8f9a");
  gradient.addColorStop(0.8, "#78cbb9");
  gradient.addColorStop(1, "#bfd9b4");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff1c6";
  ctx.beginPath();
  ctx.arc(w * 0.32, h * 0.28, Math.min(w, h) * 0.037, 0, Math.PI * 2);
  ctx.fill();
  ctx.drawImage(boatLayer, 0, 0);
  ctx.drawImage(coast.layers.foreground, 0, 0);
  for (const name of ["trunk0", "leaves0", "trunk1", "leaves1"])
    ctx.drawImage(coast.layers[name], 0, 0);
}
