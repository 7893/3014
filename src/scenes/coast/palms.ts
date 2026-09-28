import type { Random } from "../../drawing/types.ts";
import { drawCoconuts } from "./coconuts.ts";
export function paintPalm(
  ctx: CanvasRenderingContext2D,
  random: Random,
  x: number,
  y: number,
  h: number,
  lean: number,
  foliage = false,
) {
  const crownX = x + lean,
    crownY = y - h;
  if (!foliage) {
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
    return;
  }
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
          u * u * crownY + 2 * u * t * (crownY + dy - h * 0.075) + t * t * endY;
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
        ctx.fillStyle = side < 0 ? "rgba(39,73,45,.94)" : "rgba(83,107,47,.94)";
        ctx.fill();
      }
    }
  }
}
