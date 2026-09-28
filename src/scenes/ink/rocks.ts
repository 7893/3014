import type { Brush } from "../../drawing/types.ts";
export function createRocks({ ctx, random, between, noise, brush }: Brush) {
  return function rock(
    x: number,
    y: number,
    w: number,
    h: number,
    alpha: number,
  ) {
    const pts = [
      [x - w * 0.5, y],
      [x - w * 0.4, y - h * 0.7],
      [x - w * 0.1, y - h],
      [x + w * 0.33, y - h * 0.83],
      [x + w * 0.55, y - h * 0.26],
      [x + w * 0.5, y],
    ];
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
    const wash = ctx.createLinearGradient(x - w * 0.5, y - h, x + w * 0.5, y);
    wash.addColorStop(0, `rgba(63,75,58,${alpha * 0.3})`);
    wash.addColorStop(0.7, `rgba(63,75,58,${alpha * 0.18})`);
    wash.addColorStop(1, "rgba(80,90,70,0)");
    ctx.fillStyle = wash;
    ctx.fill();
    brush(pts, alpha * 0.58, 1.3);
    for (let i = 0; i < 35; i++) {
      const t = random(),
        px = x - w * 0.3 + t * w * 0.63,
        py = y - h * 0.8 + random() * h * 0.6;
      brush(
        [
          [px, py],
          [px + noise(i) * w * 0.08, py + h * between(0.06, 0.23)],
        ],
        alpha * between(0.12, 0.4),
        0.55,
      );
    }
  };
}
