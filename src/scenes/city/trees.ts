import type { Random } from "../../drawing/types.ts";
import { stroke } from "../../drawing/canvas.ts";
export function createTrees(random: Random, l: CanvasRenderingContext2D) {
  function tree(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    near = false,
  ) {
    const crown = y - size * 0.76;
    stroke(
      ctx,
      [
        [x, y],
        [x - size * 0.02, crown],
        [x + size * 0.08, y - size],
      ],
      near ? "#091b20" : "#142a29",
      Math.max(1, size * 0.025),
    );
    for (let j = 0; j < 110; j++) {
      const angle = random() * Math.PI * 2,
        rad = Math.sqrt(random());
      const xx = x + Math.cos(angle) * size * 0.48 * rad,
        yy = crown + Math.sin(angle) * size * 0.31 * rad;
      const r = size * (0.015 + random() * 0.038);
      ctx.fillStyle = near
        ? `rgba(10,27,29,${0.35 + random() * 0.5})`
        : `rgba(${18 + Math.floor(random() * 10)},${37 + Math.floor(random() * 12)},35,${0.35 + random() * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(xx, yy, r, r * 0.6, angle, 0, Math.PI * 2);
      ctx.fill();
      if (!near) {
        l.save();
        l.globalCompositeOperation = "destination-out";
        l.fillStyle = "rgba(0,0,0,.85)";
        l.beginPath();
        l.ellipse(xx, yy, r, r * 0.6, angle, 0, Math.PI * 2);
        l.fill();
        l.restore();
      }
    }
    if (near)
      for (let j = 0; j < 32; j++) {
        const dx = (random() - 0.5) * size * 0.95;
        ctx.beginPath();
        ctx.moveTo(x, crown);
        ctx.quadraticCurveTo(
          x + dx,
          crown - size * 0.16,
          x + dx + size * 0.045,
          crown + size * (0.25 + random() * 0.45),
        );
        ctx.strokeStyle = "rgba(16,37,34,.7)";
        ctx.lineWidth = 0.65;
        ctx.stroke();
      }
  }
  return tree;
}
