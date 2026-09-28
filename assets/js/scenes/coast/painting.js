import { beachPath } from "./shore.js";
import { seededRandom, canvasLayer } from "../../drawing/canvas.js";
import { drawCoastDetails } from "./details.js";
import { drawCoconuts } from "./coconuts.js";
// A warm island cove: foreground palms and sand, with all water drawn on GPU.
export function createCoast(width, height) {
  const W = 1200,
    H = (W * height) / width;
  const base = canvasLayer(width, height, W),
    canvas = base.canvas;
  let ctx = base.ctx;
  const random = seededRandom(914);
  const sand = ctx.createLinearGradient(0, H * 0.84, 0, H);
  sand.addColorStop(0, "#e9d4a4");
  sand.addColorStop(1, "#bca97b");
  const path = beachPath(W, H, 0);
  ctx.fillStyle = sand;
  ctx.fill(path);
  const material = canvasLayer(width, height, W);
  material.ctx.fillStyle = "#ff0000";
  material.ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle =
      random() > 0.5 ? "rgba(255,244,207,.14)" : "rgba(94,82,44,.08)";
    ctx.fillRect(
      random() * W,
      H * (0.85 + random() * 0.15),
      1 + random() * 2,
      0.7,
    );
  }
  ctx.restore();
  drawCoastDetails(ctx, W, H, random, material.ctx);
  const palms = [];
  function palmLayer() {
    const layer = canvasLayer(width, height, W);
    ctx = layer.ctx;
    palms.push(layer.canvas);
  }
  function palm(x, y, h, lean) {
    palmLayer();
    const crownX = x + lean,
      crownY = y - h;
    ctx.beginPath();
    ctx.moveTo(x - 7, y);
    ctx.quadraticCurveTo(x - 12, y - h * 0.57, crownX, crownY);
    ctx.quadraticCurveTo(x + 2, y - h * 0.48, x + 8, y);
    ctx.closePath();
    const trunk = ctx.createLinearGradient(x - 10, 0, x + 15, 0);
    trunk.addColorStop(0, "#4d4c32");
    trunk.addColorStop(0.5, "#a59761");
    trunk.addColorStop(1, "#555e39");
    ctx.fillStyle = trunk;
    ctx.fill();
    palmLayer();
    drawCoconuts(ctx, crownX, crownY, h);
    for (let j = 0; j < 10; j++) {
      const angle = -Math.PI * 0.94 + j * Math.PI * 0.2;
      const length = h * (0.3 + random() * 0.19),
        dx = Math.cos(angle) * length,
        dy = Math.sin(angle) * length * 0.43;
      const endX = crownX + dx,
        endY = crownY + dy + h * 0.08;
      ctx.beginPath();
      ctx.moveTo(crownX, crownY);
      ctx.quadraticCurveTo(
        crownX + dx * 0.5,
        crownY + dy - h * 0.075,
        endX,
        endY,
      );
      ctx.strokeStyle = "#536840";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      for (let k = 1; k < 30; k++) {
        const t = k / 30,
          u = 1 - t,
          px = u * u * crownX + 2 * u * t * (crownX + dx * 0.5) + t * t * endX,
          py =
            u * u * crownY +
            2 * u * t * (crownY + dy - h * 0.075) +
            t * t * endY;
        const tangentY =
          2 * (1 - t) * (dy - h * 0.075) + 2 * t * (h * 0.155 - dy);
        const norm = Math.hypot(dx, tangentY),
          nx = -tangentY / norm,
          ny = dx / norm;
        const frond = Math.sin(t * Math.PI) * h * (0.055 + random() * 0.025);
        for (const side of [-1, 1]) {
          const ex = px + nx * side * frond + (dx / norm) * frond * 0.42;
          const ey =
            py +
            ny * side * frond +
            (tangentY / norm) * frond * 0.42 +
            frond * 0.15;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.quadraticCurveTo(
            px + nx * side * frond * 0.7,
            py + ny * side * frond * 0.7,
            ex,
            ey,
          );
          ctx.quadraticCurveTo(
            px + nx * side * frond * 0.35 + 2,
            py + ny * side * frond * 0.35 + 2,
            px,
            py,
          );
          ctx.fillStyle =
            side < 0 ? "rgba(39,73,45,.94)" : "rgba(83,107,47,.94)";
          ctx.fill();
        }
      }
    }
  }
  palm(W * 0.035, H * 0.965, H * 0.47, W * 0.055);
  palm(-W * 0.025, H * 0.945, H * 0.34, W * 0.17);
  return {
    layers: {
      foreground: canvas,
      trunk0: palms[0],
      leaves0: palms[1],
      trunk1: palms[2],
      leaves1: palms[3],
      shore: material.canvas,
    },
    width,
    height,
  };
}
