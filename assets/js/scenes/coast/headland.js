export function drawHeadland(ctx, W, H, random) {
  const land = new Path2D();
  land.moveTo(W * 1.02, H * 0.516);
  land.bezierCurveTo(
    W * 0.93,
    H * 0.501,
    W * 0.9,
    H * 0.546,
    W * 0.865,
    H * 0.573,
  );
  land.bezierCurveTo(
    W * 0.846,
    H * 0.59,
    W * 0.822,
    H * 0.609,
    W * 0.774,
    H * 0.619,
  );
  land.bezierCurveTo(
    W * 0.838,
    H * 0.637,
    W * 0.935,
    H * 0.617,
    W * 1.02,
    H * 0.618,
  );
  land.closePath();
  ctx.save();
  ctx.clip(land);
  const earth = ctx.createLinearGradient(W * 0.8, H * 0.52, W, H * 0.64);
  earth.addColorStop(0, "#799888");
  earth.addColorStop(0.65, "#557b68");
  earth.addColorStop(1, "#718972");
  ctx.fillStyle = earth;
  ctx.fill(land);
  for (let i = 0; i < 210; i++) {
    const x = W * (0.78 + random() * 0.25);
    const y = H * (0.515 + random() * 0.12);
    const r = 3 + random() * 12;
    const texture = ctx.createRadialGradient(x, y, 0, x, y, r);
    texture.addColorStop(
      0,
      i % 3 ? "rgba(32,73,55,.07)" : "rgba(194,204,153,.08)",
    );
    texture.addColorStop(1, "rgba(92,124,88,0)");
    ctx.fillStyle = texture;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.5, -0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  // A narrow curved strand follows the foot of the headland.
  ctx.beginPath();
  ctx.moveTo(W * 0.774, H * 0.619);
  ctx.bezierCurveTo(
    W * 0.838,
    H * 0.637,
    W * 0.935,
    H * 0.617,
    W * 1.02,
    H * 0.618,
  );
  ctx.strokeStyle = "rgba(215,209,172,.8)";
  ctx.lineWidth = H * 0.004;
  ctx.stroke();
  ctx.strokeStyle = "rgba(192,217,198,.34)";
  ctx.lineWidth = H * 0.0013;
  ctx.stroke();
}
