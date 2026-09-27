// A compressed, imagined Beijing waterfront, generated from geometry and light.
export const cityLayerNames = ["buildings", "lights", "bank"];
export function createCity(width, height) {
  const portrait = width / height < 0.85,
    W = portrait ? 760 : 1600,
    H = (W * height) / width;
  const layers = {},
    contexts = {};
  for (const name of cityLayerNames) {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d");
    ctx.scale(width / W, height / H);
    layers[name] = c;
    contexts[name] = ctx;
  }
  const { buildings: b, lights: l, bank: k } = contexts;
  let seed = 2873;
  const random = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  function polygon(ctx, points) {
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
  }
  function facade(path, x, y, w, h, depth = 1, diagonal = false) {
    b.save();
    b.clip(path);
    const fill = b.createLinearGradient(x, y, x + w, y + h);
    fill.addColorStop(0, depth < 0.5 ? "#52636b" : "#243845");
    fill.addColorStop(0.45, depth < 0.5 ? "#3e545f" : "#142b39");
    fill.addColorStop(1, "#0b202d");
    b.fillStyle = fill;
    b.fillRect(x - 5, y - 5, w + 10, h + 10);
    b.strokeStyle = "rgba(179,190,184,.12)";
    b.lineWidth = 0.6;
    for (let yy = y + 5; yy < y + h; yy += 8) {
      b.beginPath();
      b.moveTo(x, yy);
      b.lineTo(x + w, yy);
      b.stroke();
    }
    for (let xx = x + 4; xx < x + w; xx += 6) {
      b.strokeStyle = "rgba(161,183,189,.10)";
      b.beginPath();
      b.moveTo(xx, y);
      b.lineTo(xx, y + h);
      b.stroke();
    }
    if (diagonal) {
      b.strokeStyle = "rgba(192,196,180,.32)";
      b.lineWidth = 1.1;
      for (let i = -h; i < w + h; i += 22) {
        b.beginPath();
        b.moveTo(x + i, y);
        b.lineTo(x + i + h * 0.65, y + h);
        b.stroke();
        b.beginPath();
        b.moveTo(x + i, y);
        b.lineTo(x + i - h * 0.65, y + h);
        b.stroke();
      }
    }
    b.restore();
    b.strokeStyle = depth < 0.5 ? "#78909244" : "#b0b3a45a";
    b.lineWidth = 1;
    b.stroke(path);
    l.save();
    l.clip(path);
    for (let yy = y + 9; yy < y + h - 4; yy += 9)
      for (let xx = x + 5; xx < x + w - 3; xx += 7) {
        if (random() > 0.43) {
          l.fillStyle =
            random() > 0.22
              ? `rgba(238,194,121,${0.22 + random() * 0.6})`
              : `rgba(139,196,210,${0.2 + random() * 0.35})`;
          l.fillRect(xx, yy, random() > 0.9 ? 5 : 2.8, 3.8);
        }
      }
    l.restore();
  }
  const base = H * 0.635;
  // Distant districts form a low skyline behind the two recognizable landmarks.
  for (let i = 0; i < 42; i++) {
    const x = (i / 41) * W - 20,
      w = 18 + random() * 36,
      h = H * (0.035 + random() * 0.15),
      y = base - h;
    const p = new Path2D();
    p.rect(x, y, w, h);
    facade(p, x, y, w, h, 0.3);
  }
  // China Zun: broad crown and base, a pinched waist, fine vertical ribs.
  const zx = W * (portrait ? 0.34 : 0.405),
    zt = H * (portrait ? 0.265 : 0.15),
    zb = base,
    zw = W * (portrait ? 0.14 : 0.065),
    zh = zb - zt;
  const zun = new Path2D();
  zun.moveTo(zx - zw * 0.62, zt);
  zun.lineTo(zx + zw * 0.62, zt);
  zun.bezierCurveTo(
    zx + zw * 0.41,
    zt + zh * 0.22,
    zx + zw * 0.27,
    zt + zh * 0.57,
    zx + zw * 0.63,
    zb,
  );
  zun.lineTo(zx - zw * 0.63, zb);
  zun.bezierCurveTo(
    zx - zw * 0.27,
    zt + zh * 0.57,
    zx - zw * 0.41,
    zt + zh * 0.22,
    zx - zw * 0.62,
    zt,
  );
  zun.closePath();
  facade(zun, zx - zw * 0.65, zt, zw * 1.3, zh, 1);
  b.save();
  b.clip(zun);
  b.strokeStyle = "rgba(204,194,151,.45)";
  b.lineWidth = 0.8;
  for (let i = -6; i <= 6; i++) {
    const t = i / 6;
    b.beginPath();
    b.moveTo(zx + t * zw * 0.61, zt);
    b.bezierCurveTo(
      zx + t * zw * 0.41,
      zt + zh * 0.22,
      zx + t * zw * 0.27,
      zt + zh * 0.57,
      zx + t * zw * 0.62,
      zb,
    );
    b.stroke();
  }
  b.restore();
  l.strokeStyle = "#d8b56e";
  l.lineWidth = 2;
  l.beginPath();
  l.moveTo(zx - zw * 0.57, zt + 3);
  l.lineTo(zx + zw * 0.57, zt + 3);
  l.stroke();
  // CCTV headquarters: two leaning legs connected by an angular overhang.
  const cx = W * (portrait ? 0.73 : 0.665),
    cy = H * (portrait ? 0.415 : 0.34),
    cw = W * (portrait ? 0.23 : 0.18),
    ch = base - cy;
  const pts = [
    [-0.48, 1],
    [-0.6, 0],
    [-0.19, -0.07],
    [0.58, 0.25],
    [0.43, 0.91],
    [0.11, 0.91],
    [0.23, 0.4],
    [-0.2, 0.21],
    [-0.09, 1],
  ].map(([x, y]) => [cx + x * cw, cy + y * ch]);
  const cctv = new Path2D();
  pts.forEach(([x, y], i) => (i ? cctv.lineTo(x, y) : cctv.moveTo(x, y)));
  cctv.closePath();
  facade(cctv, cx - cw * 0.61, cy - ch * 0.08, cw * 1.22, ch * 1.08, 1, true);
  l.strokeStyle = "rgba(244,198,117,.55)";
  l.lineWidth = 1.3;
  l.stroke(cctv);
  // Lower foreground blocks vary in height, setback and warm edge illumination.
  for (let i = 0; i < 18; i++) {
    const x = (i / 18) * W - 15,
      w = 25 + random() * 45,
      h = H * (0.025 + random() * 0.055),
      y = base - h;
    const p = new Path2D();
    p.rect(x, y, w, h);
    facade(p, x, y, w, h, 1);
  }
  // An elevated bridge crosses the water: structure stays still, traffic is rendered on GPU.
  const deck = H * 0.69;
  k.fillStyle = "#102735";
  k.fillRect(0, deck, W, 9);
  k.fillStyle = "#263c44";
  k.fillRect(0, deck - 8, W, 5);
  k.strokeStyle = "rgba(219,181,116,.62)";
  k.lineWidth = 1.4;
  k.beginPath();
  k.moveTo(0, deck - 3);
  k.lineTo(W, deck - 3);
  k.stroke();
  for (let x = -W * 0.1; x < W; x += W * 0.22) {
    k.fillStyle = "#122936";
    k.beginPath();
    k.moveTo(x, deck + 7);
    k.lineTo(x + 10, deck + 7);
    k.lineTo(x + 6, H * 0.751);
    k.lineTo(x - 3, H * 0.751);
    k.closePath();
    k.fill();
  }
  for (let x = 35; x < W; x += W * 0.105) {
    k.strokeStyle = "#243c48";
    k.lineWidth = 1.4;
    k.beginPath();
    k.moveTo(x, deck - 8);
    k.lineTo(x, deck - 32);
    k.lineTo(x + 10, deck - 34);
    k.stroke();
    l.fillStyle = "#f0c98a";
    l.beginPath();
    l.ellipse(x + 10, deck - 33, 3, 1.3, 0, 0, Math.PI * 2);
    l.fill();
  }
  // A low waterside roof and willow silhouettes connect old Beijing with the modern city.
  const by = H * 0.79;
  k.fillStyle = "#0b202b";
  polygon(k, [
    [0, by],
    [W * 0.09, by - 10],
    [W * 0.18, by + 25],
    [W * 0.22, H * 0.93],
    [0, H * 0.97],
  ]);
  k.fill();
  const rx = W * 0.095,
    ry = H * 0.752,
    rw = W * (portrait ? 0.105 : 0.065);
  k.fillStyle = "#182c34";
  k.fillRect(rx - rw * 0.6, ry, rw * 1.2, H * 0.035);
  k.fillStyle = "#10232d";
  polygon(k, [
    [rx - rw, ry],
    [rx - rw * 0.7, ry - 4],
    [rx, ry - H * 0.031],
    [rx + rw * 0.7, ry - 4],
    [rx + rw, ry],
    [rx + rw * 0.4, ry - 2],
    [rx - rw * 0.4, ry - 2],
  ]);
  k.fill();
  for (let i = -1; i <= 1; i++) {
    k.fillStyle = "#bb8d4b88";
    k.fillRect(rx + i * rw * 0.32 - rw * 0.08, ry + 5, rw * 0.16, H * 0.019);
  }
  k.strokeStyle = "#081e28";
  k.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const tx = W * (0.025 + i * 0.035),
      ty = H * (0.865 - i * 0.02),
      th = H * (portrait ? 0.1 : 0.15);
    k.lineWidth = 4 - i;
    k.beginPath();
    k.moveTo(tx, ty);
    k.quadraticCurveTo(tx + 12, ty - th * 0.55, tx - 7, ty - th);
    k.stroke();
    for (let j = 0; j < 15; j++) {
      k.lineWidth = 0.7;
      const ex = tx + (j - 7) * 6,
        ey = ty - th + Math.abs(j - 7) * 2;
      k.beginPath();
      k.moveTo(tx - 7, ty - th + 8);
      k.quadraticCurveTo(ex, ey - 15, ex + 8, ey + th * 0.35);
      k.stroke();
    }
  }
  return { layers, width, height, portrait };
}

export function drawStaticCity(ctx, city, boatLayer) {
  const { width: w, height: h, layers } = city;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#102330");
  sky.addColorStop(0.57, "#63727a");
  sky.addColorStop(0.63, "#455d68");
  sky.addColorStop(0.64, "#152d3b");
  sky.addColorStop(1, "#081d2b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(layers.buildings, 0, 0);
  ctx.drawImage(layers.lights, 0, 0);
  ctx.save();
  ctx.translate(0, h * 0.64);
  ctx.scale(1, -0.62);
  ctx.translate(0, -h * 0.635);
  ctx.globalAlpha = 0.26;
  ctx.drawImage(layers.buildings, 0, 0);
  ctx.globalAlpha = 0.38;
  ctx.drawImage(layers.lights, 0, 0);
  ctx.restore();
  ctx.drawImage(layers.bank, 0, 0);
  ctx.drawImage(boatLayer, 0, 0);
}
