// An imagined Liangma River evening, drawn entirely from geometry and light.
export const cityLayerNames = ["buildings", "lights", "bank"];
export function createCity(width, height) {
  const portrait = width / height < 0.85,
    W = portrait ? 760 : 1600,
    H = (W * height) / width;
  const layers = {},
    contexts = {};
  for (const name of cityLayerNames) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.scale(width / W, height / H);
    layers[name] = canvas;
    contexts[name] = ctx;
  }
  const { buildings: b, lights: l, bank: k } = contexts;
  let seed = 2873;
  const random = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  function glow(ctx, x, y, r, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function stroke(ctx, points, color, width = 1) {
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  // Low, recessed buildings: irregular occupied rooms, no outlined landmark icons.
  for (let i = 0; i < 25; i++) {
    const x = (i * W) / 24 - 30,
      w = 24 + random() * 65,
      h = H * (0.035 + random() * 0.14),
      y = H * 0.59 - h;
    const shade = b.createLinearGradient(x, y, x + w, H * 0.59);
    shade.addColorStop(0, "#26343c");
    shade.addColorStop(1, "#15292e");
    b.fillStyle = shade;
    b.fillRect(x, y, w, h);
    b.fillStyle = "rgba(137,157,158,.05)";
    b.fillRect(x, y, w, 2);
    for (let yy = y + 8; yy < H * 0.585; yy += 7 + random() * 3) {
      const occupied = random();
      for (let xx = x + 4; xx < x + w - 4; xx += 5) {
        if (random() > occupied * 0.8 + 0.26) {
          l.fillStyle = `rgba(226,${164 + Math.floor(random() * 42)},115,${0.07 + random() * 0.32})`;
          l.fillRect(xx, yy, 1.5 + random() * 2, 2.4);
        }
      }
    }
  }
  // A quiet hotel frontage glimpsed through the trees, set back from the river.
  const hx = W * 0.18,
    hy = H * 0.425,
    hw = W * 0.2,
    hh = H * 0.16;
  b.fillStyle = "#1c3037";
  b.fillRect(hx, hy, hw, hh);
  for (let floor = 0; floor < 12; floor++) {
    const y = hy + 8 + (floor * hh) / 13;
    stroke(
      b,
      [
        [hx, y],
        [hx + hw, y],
      ],
      "rgba(114,133,136,.11)",
      1,
    );
    for (let x = hx + 5; x < hx + hw - 5; x += 6)
      if (random() > 0.47) {
        l.fillStyle = `rgba(236,190,130,${0.13 + random() * 0.3})`;
        l.fillRect(x, y - 3, 2 + random() * 2, 2);
      }
  }
  function tree(ctx, x, y, size, near = false) {
    const crown = y - size * 0.76;
    stroke(
      ctx,
      [
        [x, y],
        [x - size * 0.02, crown],
        [x + size * 0.08, y - size],
      ],
      near ? "#091b20" : "#142a29",
      Math.max(1, size * 0.025),
    );
    for (let j = 0; j < 110; j++) {
      const angle = random() * Math.PI * 2,
        rad = Math.sqrt(random());
      const xx = x + Math.cos(angle) * size * 0.48 * rad,
        yy = crown + Math.sin(angle) * size * 0.31 * rad;
      const r = size * (0.015 + random() * 0.038);
      ctx.fillStyle = near
        ? `rgba(10,27,29,${0.35 + random() * 0.5})`
        : `rgba(${18 + Math.floor(random() * 10)},${37 + Math.floor(random() * 12)},35,${0.35 + random() * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(xx, yy, r, r * 0.6, angle, 0, Math.PI * 2);
      ctx.fill();
      if (!near) {
        l.save();
        l.globalCompositeOperation = "destination-out";
        l.fillStyle = "rgba(0,0,0,.85)";
        l.beginPath();
        l.ellipse(xx, yy, r, r * 0.6, angle, 0, Math.PI * 2);
        l.fill();
        l.restore();
      }
    }
    if (near)
      for (let j = 0; j < 32; j++) {
        const dx = (random() - 0.5) * size * 0.95;
        ctx.beginPath();
        ctx.moveTo(x, crown);
        ctx.quadraticCurveTo(
          x + dx,
          crown - size * 0.16,
          x + dx + size * 0.045,
          crown + size * (0.25 + random() * 0.45),
        );
        ctx.strokeStyle = "rgba(16,37,34,.7)";
        ctx.lineWidth = 0.65;
        ctx.stroke();
      }
  }
  // The opposite promenade lies behind the waterline, so its lights reflect naturally.
  b.fillStyle = "#162b2d";
  b.fillRect(0, H * 0.582, W, H * 0.058);
  for (let i = 0; i < 58; i++)
    tree(b, (i * W) / 57, H * 0.613, H * (0.035 + random() * 0.055));
  for (let j = 0; j < 4; j++)
    stroke(
      b,
      [
        [0, H * (0.619 + j * 0.005)],
        [W, H * (0.619 + j * 0.005)],
      ],
      j === 0 ? "#4a4940" : "#253734",
      1.3,
    );
  stroke(
    l,
    [
      [0, H * 0.63],
      [W, H * 0.63],
    ],
    "rgba(229,180,103,.38)",
    1.1,
  );
  for (let i = 0; i < 29; i++) {
    const x = (i * W) / 28 + random() * 8,
      y = H * 0.615;
    stroke(
      b,
      [
        [x, y],
        [x, y - H * 0.026],
      ],
      "#53605b",
      0.85,
    );
    glow(l, x, y - H * 0.026, 12, "rgba(246,202,128,.25)");
    l.fillStyle = "#ead2a3";
    l.fillRect(x - 1, y - H * 0.026, 2, 1.5);
    // Tiny pedestrians, in pairs and alone.
    if (i % 3 !== 0) {
      const px = x + 11;
      b.fillStyle = "#0b1c20";
      b.beginPath();
      b.arc(px, y - 6, 1.2, 0, Math.PI * 2);
      b.fill();
      stroke(
        b,
        [
          [px, y - 4],
          [px, y + 1],
        ],
        "#0b1c20",
        1.5,
      );
    }
  }
  // A single shallow illuminated footbridge, recessed behind the boat's route.
  const left = W * 0.42,
    right = W * 0.92,
    deck = H * 0.608,
    arch = H * 0.031;
  b.beginPath();
  b.moveTo(left, deck + 8);
  b.quadraticCurveTo((left + right) / 2, deck - arch, right, deck + 8);
  b.lineTo(right, deck + 15);
  b.quadraticCurveTo((left + right) / 2, deck - arch + 8, left, deck + 15);
  b.closePath();
  b.fillStyle = "#182c31";
  b.fill();
  for (let i = 0; i <= 60; i++) {
    const t = i / 60,
      x = left + (right - left) * t,
      y = deck - 2 * arch * t * (1 - t);
    stroke(
      b,
      [
        [x, y - 7],
        [x, y + 5],
      ],
      "rgba(132,143,131,.45)",
      0.7,
    );
    glow(l, x, y + 6, 4, "rgba(235,183,113,.15)");
  }
  for (const [offset, color] of [
    [-7, "rgba(209,199,161,.32)"],
    [6, "rgba(246,185,99,.72)"],
  ]) {
    l.beginPath();
    l.moveTo(left, deck + offset);
    l.quadraticCurveTo(
      (left + right) / 2,
      deck - arch + offset,
      right,
      deck + offset,
    );
    l.strokeStyle = color;
    l.lineWidth = 1.2;
    l.stroke();
  }
  // A shaded near bank frames the water without crossing the boat's horizontal route.
  k.beginPath();
  k.moveTo(0, H * 0.89);
  k.bezierCurveTo(W * 0.15, H * 0.92, W * 0.18, H * 0.97, W * 0.43, H);
  k.lineTo(0, H);
  k.closePath();
  k.fillStyle = "#0a1c20";
  k.fill();
  k.beginPath();
  k.moveTo(W, H * 0.895);
  k.bezierCurveTo(W * 0.89, H * 0.93, W * 0.82, H * 0.98, W * 0.69, H);
  k.lineTo(W, H);
  k.closePath();
  k.fill();
  for (let i = 0; i < 4; i++) {
    const x = W * (-0.035 + i * 0.033),
      y = H * (0.91 + i * 0.015);
    tree(k, x, y, H * (0.21 + random() * 0.045), true);
  }
  // Scattered grass blades and textured stones at the viewer's feet.
  for (let i = 0; i < 500; i++) {
    const x = random() * W,
      y = H * (0.95 + random() * 0.05);
    if (x > W * 0.25 && x < W * 0.83) continue;
    stroke(
      k,
      [
        [x, y],
        [x + (random() - 0.5) * 7, y - random() * 10],
      ],
      "rgba(40,56,45,.38)",
      0.6,
    );
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
