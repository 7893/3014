// Artistic compression of Beijing's skyline, not a literal viewpoint from the river.
export function drawBeijingSkyline(b, l, W, H) {
  const x = W * 0.47,
    top = H * (W / H < 0.85 ? 0.35 : 0.28),
    base = H * 0.59,
    w = W * (W / H < 0.85 ? 0.095 : 0.045),
    h = base - top;
  const tower = new Path2D();
  tower.moveTo(x - w * 0.62, top);
  tower.lineTo(x + w * 0.62, top);
  tower.bezierCurveTo(
    x + w * 0.34,
    top + h * 0.3,
    x + w * 0.3,
    top + h * 0.62,
    x + w * 0.66,
    base,
  );
  tower.lineTo(x - w * 0.66, base);
  tower.bezierCurveTo(
    x - w * 0.3,
    top + h * 0.62,
    x - w * 0.34,
    top + h * 0.3,
    x - w * 0.62,
    top,
  );
  tower.closePath();
  b.fillStyle = "#263d48";
  b.fill(tower);
  b.save();
  b.clip(tower);
  l.save();
  l.clip(tower);
  for (let i = -6; i <= 6; i++) {
    b.beginPath();
    b.moveTo(x + i * w * 0.095, top);
    b.bezierCurveTo(
      x + i * w * 0.055,
      top + h * 0.32,
      x + i * w * 0.048,
      top + h * 0.65,
      x + i * w * 0.1,
      base,
    );
    b.strokeStyle = "rgba(164,179,175,.24)";
    b.lineWidth = 0.7;
    b.stroke();
    for (let j = 1; j < 48; j++) {
      const t = j / 48,
        waist = 0.55 + 0.4 * Math.pow(2 * t - 1, 2);
      if ((i * 17 + j * 13) % 7 === 0) continue;
      l.fillStyle = `rgba(217,194,147,${0.1 + (j % 4) * 0.045})`;
      l.fillRect(x + i * w * 0.095 * waist, top + t * h, 1.1, 1.8);
    }
  }
  b.restore();
  l.restore();
  l.strokeStyle = "rgba(231,192,122,.72)";
  l.lineWidth = 1.3;
  l.beginPath();
  l.moveTo(x - w * 0.6, top + 2);
  l.lineTo(x + w * 0.6, top + 2);
  l.stroke();
  // A smaller angled silhouette sits below the Zun's crown.
  const cx = W * 0.66,
    cy = H * 0.455,
    cw = W * (W / H < 0.85 ? 0.15 : 0.09),
    ch = H * 0.135;
  const shape = new Path2D();
  [
    [-0.48, 1],
    [-0.6, 0],
    [-0.19, -0.07],
    [0.58, 0.25],
    [0.43, 0.91],
    [0.11, 0.91],
    [0.23, 0.4],
    [-0.2, 0.21],
    [-0.09, 1],
  ].forEach(([px, py], i) =>
    i
      ? shape.lineTo(cx + px * cw, cy + py * ch)
      : shape.moveTo(cx + px * cw, cy + py * ch),
  );
  shape.closePath();
  b.fillStyle = "#2b4149";
  b.fill(shape);
  b.strokeStyle = "rgba(166,175,158,.3)";
  b.lineWidth = 0.8;
  b.stroke(shape);
  l.save();
  l.clip(shape);
  l.strokeStyle = "rgba(215,189,135,.16)";
  l.lineWidth = 0.7;
  for (let i = -ch; i < cw + ch; i += 10) {
    l.beginPath();
    l.moveTo(cx - cw + i, cy);
    l.lineTo(cx - cw + i + ch * 0.6, cy + ch);
    l.stroke();
  }
  l.restore();
}
export function drawRiverTerrace(b, l, W, H) {
  const x = W * 0.075,
    y = H * 0.61,
    w = W * 0.23;
  b.fillStyle = "#172d31";
  b.fillRect(x, y - H * 0.028, w, H * 0.032);
  for (let i = 0; i < 8; i++) {
    const xx = x + ((i + 0.5) * w) / 8;
    l.fillStyle = "rgba(241,180,97,.42)";
    l.fillRect(xx - w * 0.033, y - H * 0.019, w * 0.052, H * 0.014);
    b.fillStyle = "#283833";
    b.beginPath();
    b.ellipse(xx, y - H * 0.003, w * 0.035, 1.5, 0, 0, Math.PI * 2);
    b.fill();
  }
  for (let i = 0; i < 19; i++) {
    const t = i / 18,
      xx = x + t * w,
      yy = y - H * 0.038 + Math.sin(t * Math.PI) * H * 0.005;
    l.fillStyle = "rgba(247,205,137,.8)";
    l.beginPath();
    l.arc(xx, yy, 1.1, 0, Math.PI * 2);
    l.fill();
  }
}
