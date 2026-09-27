import { drawCoastDetails } from "./details.js";
// A warm island cove: foreground palms and sand, with all water drawn on GPU.
export function createCoast(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  let ctx = canvas.getContext("2d");
  const W = 1200,
    H = (W * height) / width;
  ctx.scale(width / W, height / H);
  let seed = 914;
  const random = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  const sand = ctx.createLinearGradient(0, H * 0.84, 0, H);
  sand.addColorStop(0, "#e9d4a4");
  sand.addColorStop(1, "#bca97b");
  ctx.beginPath();
  ctx.moveTo(0, H * 0.855);
  ctx.bezierCurveTo(W * 0.14, H * 0.88, W * 0.17, H * 0.96, W * 0.53, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = sand;
  ctx.fill();
  ctx.save();
  ctx.clip();
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle =
      random() > 0.5 ? "rgba(255,244,207,.14)" : "rgba(94,82,44,.08)";
    ctx.fillRect(
      random() * W,
      H * (0.85 + random() * 0.15),
      1 + random() * 2,
      0.7,
    );
  }
  ctx.restore();
  drawCoastDetails(ctx, W, H, random);
  const palms = [];
  function palmLayer() {
    const layer = document.createElement("canvas");
    layer.width = width;
    layer.height = height;
    ctx = layer.getContext("2d");
    ctx.scale(width / W, height / H);
    palms.push(layer);
  }
  function palm(x, y, h, lean) {
    palmLayer();
    const crownX = x + lean,
      crownY = y - h;
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
    palmLayer();
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
            u * u * crownY +
            2 * u * t * (crownY + dy - h * 0.075) +
            t * t * endY;
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
          ctx.fillStyle =
            side < 0 ? "rgba(39,73,45,.94)" : "rgba(83,107,47,.94)";
          ctx.fill();
        }
      }
    }
  }
  palm(W * 0.035, H * 0.965, H * 0.47, W * 0.055);
  palm(-W * 0.025, H * 0.945, H * 0.34, W * 0.17);
  return { layer: canvas, palms, width, height };
}
export function drawStaticCoast(ctx, coast, boatLayer) {
  const { width: w, height: h } = coast;
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "#78b7c4");
  gradient.addColorStop(0.46, "#f7dfb1");
  gradient.addColorStop(0.461, "#3b8f9a");
  gradient.addColorStop(0.8, "#78cbb9");
  gradient.addColorStop(1, "#bfd9b4");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff1c6";
  ctx.beginPath();
  ctx.arc(w * 0.32, h * 0.28, Math.min(w, h) * 0.037, 0, Math.PI * 2);
  ctx.fill();
  ctx.drawImage(boatLayer, 0, 0);
  ctx.drawImage(coast.layer, 0, 0);
  for (const layer of coast.palms) ctx.drawImage(layer, 0, 0);
}
