import type { Brush } from "../../drawing/types.ts";
export function paintBamboo(
  { ctx, between, brush, ink }: Brush,
  x: number,
  y: number,
  height: number,
) {
  for (let stem = 0; stem < 8; stem++) {
    const h = height * between(0.62, 1),
      lean = between(-0.35, 0.38) * height;
    const root = x + between(-9, 9);
    const point = (t: number) => [root + lean * t * t, y - h * t];
    brush(
      Array.from({ length: 13 }, (_, i) => point(i / 12)),
      0.58,
      1.4,
    );
    for (let node = 2; node < 10; node++) {
      const t = node / 10,
        [px, py] = point(t);
      brush(
        [
          [px - 1.8, py],
          [px + 2, py - 0.6],
        ],
        0.72,
        0.85,
      );
      if (node < 4) continue;
      const direction = node % 2 ? 1 : -1;
      const reach = h * between(0.1, 0.22) * direction;
      brush(
        [
          [px, py],
          [px + reach * 0.6, py - h * 0.025],
          [px + reach, py - h * 0.05],
        ],
        0.45,
        0.7,
      );
      for (let leaf = 0; leaf < 7; leaf++) {
        const bx = px + (reach * leaf) / 7,
          by = py - (h * 0.045 * leaf) / 7;
        const length = h * between(0.035, 0.075),
          side = leaf % 2 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(
          bx + direction * length * 0.55,
          by + side * length * 0.18,
          bx + direction * length,
          by + side * length * 0.7,
        );
        ctx.quadraticCurveTo(
          bx + direction * length * 0.38,
          by + side * length * 0.48,
          bx,
          by,
        );
        ctx.fillStyle = ink(between(0.4, 0.72));
        ctx.fill();
      }
    }
  }
}

export function paintBroadleaf(
  { ctx, between, brush, ink }: Brush,
  x: number,
  y: number,
  h: number,
  alpha = 0.5,
) {
  brush(
    [
      [x, y],
      [x - h * 0.025, y - h * 0.6],
      [x + h * 0.08, y - h * 0.86],
    ],
    alpha,
    h * 0.025,
  );
  for (let branch = 0; branch < 6; branch++) {
    const side = branch % 2 ? 1 : -1;
    const bx = x + side * h * between(0.12, 0.32),
      by = y - h * between(0.55, 0.95);
    brush(
      [
        [x, y - h * 0.43],
        [bx, by],
      ],
      alpha * 0.65,
      h * 0.013,
    );
    for (let leaf = 0; leaf < 36; leaf++) {
      const a = between(0, Math.PI * 2),
        r = Math.sqrt(between(0, 1));
      ctx.fillStyle = ink(alpha * between(0.15, 0.55));
      ctx.beginPath();
      ctx.ellipse(
        bx + Math.cos(a) * h * 0.19 * r,
        by + Math.sin(a) * h * 0.12 * r,
        h * between(0.025, 0.065),
        h * between(0.012, 0.035),
        -0.4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}
