export function drawCoconuts(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
) {
  const radius = height * 0.022;
  // The rear fruit sits under the fronds; overlapping shells give the bunch depth.
  const fruit = [
    [-0.65, 0.7, 0.85],
    [0.7, 0.8, 0.8],
    [-1.1, 1.5, 0.9],
    [0.3, 1.65, 1],
    [1.3, 1.45, 0.85],
  ];
  ctx.save();
  ctx.lineCap = "round";
  for (const [dx, dy, size] of fruit) {
    const xx = x + dx * radius,
      yy = y + dy * radius,
      r = radius * size;
    ctx.strokeStyle = "#687044";
    ctx.lineWidth = Math.max(0.8, radius * 0.18);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(xx, y + radius * 0.4, xx, yy);
    ctx.stroke();
    const shade = ctx.createRadialGradient(
      xx - r * 0.35,
      yy - r * 0.4,
      r * 0.05,
      xx,
      yy,
      r * 1.1,
    );
    shade.addColorStop(0, "#a4a15d");
    shade.addColorStop(0.5, "#788343");
    shade.addColorStop(1, "#394c2f");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.ellipse(xx, yy, r * 0.82, r, dx * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(48,64,34,.28)";
    ctx.lineWidth = Math.max(0.5, r * 0.07);
    ctx.beginPath();
    ctx.ellipse(xx, yy, r * 0.36, r * 0.85, dx * 0.18, -0.8, 1.3);
    ctx.stroke();
  }
  ctx.restore();
}
