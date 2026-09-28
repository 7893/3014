import type { Brush } from "./types.ts";
export function paintBoat(
  tools: Brush,
  x: number,
  y: number,
  scale: number,
  crew = true,
  passenger = false,
) {
  const { ctx, ink, brush, line } = tools;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = ink(0.73);
  ctx.beginPath();
  ctx.moveTo(-24, -2);
  ctx.quadraticCurveTo(0, 6, 25, -3);
  ctx.quadraticCurveTo(14, 8, -10, 6);
  ctx.closePath();
  ctx.fill();
  if (!passenger) brush(
    [
      [-9, -2],
      [-8, -9],
      [-2, -11],
      [7, -9],
      [10, -1],
    ],
    0.65,
    1,
  );
  if (passenger) {
    // Seated profile: bun, neck, draped sleeves and a skirt resting inside the hull.
    ctx.fillStyle = ink(.83);
    ctx.beginPath(); ctx.ellipse(-6, -13.2, 1.7, 2.1, -.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-7, -15.5, 1.25, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6.5, -11.5);
    ctx.quadraticCurveTo(-10, -9, -10.5, -3);
    ctx.quadraticCurveTo(-5, -1, 1, -2);
    ctx.lineTo(-1, -4); ctx.lineTo(-5, -5);
    ctx.quadraticCurveTo(-3.5, -8, -5, -11.5); ctx.fill();
    line([[-5, -9], [-2, -6], [1, -6]], ink(.72), .85);
  }
  if (crew) {
    ctx.fillStyle = ink(0.78);
    ctx.beginPath();
    ctx.arc(13, -10, 1.6, 0, Math.PI * 2);
    ctx.fill();
    brush(
      [
        [13, -8],
        [12, -2],
        [17, -1],
      ],
      0.72,
      1.3,
    );
    line(
      [
        [15, -5],
        [31, 7],
      ],
      ink(0.56),
      0.8,
    );
  }
  for (let i = 0; i < 5; i++)
    line(
      [
        [-19 + i * 2, 10 + i * 3],
        [19 - i * 3, 10 + i * 3],
      ],
      ink(0.09 - i * 0.014),
      0.6,
    );
  ctx.restore();
}
