import { seededRandom } from "./canvas.js";
export function createBrush(ctx, initialSeed = 17341) {
  const random = seededRandom(initialSeed);
  const between = (a, b) => a + random() * (b - a);
  const ink = (alpha = 1) => `rgba(43,57,49,${alpha})`;
  function noise(x, y = 0) {
    return (
      Math.sin(x * 1.31 + y * 0.53) * 0.48 +
      Math.sin(x * 3.71 - y * 1.2) * 0.28 +
      Math.sin(x * 9.23 + y * 2.4) * 0.14 +
      Math.sin(x * 23.5 + y * 5.7) * 0.1
    );
  }
  function line(points, color, size = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }
  function brush(points, strength, size = 1) {
    line(points, ink(strength * 0.24), size * 3);
    line(points, ink(strength), size);
    if (size > 1)
      line(
        points.map(([x, y]) => [x + 0.5, y - 0.4]),
        "rgba(232,226,205,.22)",
        size * 0.24,
      );
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  return { ctx, random, between, ink, noise, line, brush };
}
