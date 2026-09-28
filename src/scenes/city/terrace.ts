export function drawRiverTerrace(
  b: CanvasRenderingContext2D,
  l: CanvasRenderingContext2D,
  W: number,
  H: number,
) {
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
