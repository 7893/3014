// Every mark is generated locally. No images, fonts, or remote assets are loaded.
export function paintLandscape(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const portrait = width / height < 0.85;
  const W = portrait ? 760 : 1600;
  const H = (W * height) / width;
  ctx.scale(width / W, height / H);
  let seed = 17341;
  const random = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
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
  ctx.fillStyle = "#ede8db";
  ctx.fillRect(0, 0, W, H);
  // Low-frequency paper tint, then individual rice-paper fibres.
  const paper = ctx.createRadialGradient(
    W * 0.47,
    H * 0.38,
    0,
    W * 0.5,
    H * 0.5,
    Math.max(W, H) * 0.75,
  );
  paper.addColorStop(0, "#f4f0e4");
  paper.addColorStop(1, "#e4decd");
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 16000; i++) {
    const x = random() * W,
      y = random() * H;
    line(
      [
        [x, y],
        [x + between(0.3, 2), y + between(-0.6, 0.6)],
      ],
      `rgba(102,91,65,${between(0.012, 0.055)})`,
      between(0.3, 0.7),
    );
  }

  function mountain(cx, base, span, elevation, strength, phase, detail = true) {
    const count = 160;
    // Irregular ridges have broad shoulders and narrow summits, not sine-wave hills.
    function ridge(t) {
      const envelope = Math.pow(Math.max(0, Math.sin(Math.PI * t)), 0.82);
      const peaks =
        0.57 +
        0.24 * Math.sin(t * 9.1 + phase) +
        0.16 * Math.sin(t * 18.4 + phase * 0.7);
      const broken =
        noise(t * 38, phase) * 0.036 + noise(t * 105, phase) * 0.008;
      return base - elevation * Math.max(0, envelope * (peaks + broken));
    }
    const left = cx - span * 0.5;
    const contour = Array.from({ length: count + 1 }, (_, i) => [
      left + (span * i) / count,
      ridge(i / count),
    ]);
    const path = new Path2D();
    path.moveTo(left, base);
    contour.forEach(([x, y]) => path.lineTo(x, y));
    path.lineTo(left + span, base + 40);
    path.lineTo(left, base + 40);
    path.closePath();
    ctx.save();
    ctx.clip(path);
    const wash = ctx.createLinearGradient(0, base - elevation, 0, base + 15);
    wash.addColorStop(0, `rgba(74,98,86,${strength * 0.7})`);
    wash.addColorStop(0.5, `rgba(103,120,101,${strength * 0.54})`);
    wash.addColorStop(0.84, `rgba(120,135,115,${strength * 0.18})`);
    wash.addColorStop(1, "rgba(150,151,126,0)");
    ctx.fillStyle = wash;
    ctx.fillRect(left, base - elevation, span, elevation + 60);
    // Broad, broken ink washes describe shaded rock faces beneath the fine strokes.
    if (detail)
      for (let j = 0; j < 52; j++) {
        const t = between(0.04, 0.96),
          top = ridge(t),
          depth = base - top;
        const start = between(0.01, 0.3),
          end = between(0.45, 0.95);
        const spread = between(4, 20),
          points = [];
        for (let k = 0; k <= 20; k++) {
          const q = start + ((end - start) * k) / 20;
          points.push([
            left + t * span + noise(q * 7, t * 16) * 12 + q * 18,
            top + depth * q,
          ]);
        }
        ctx.beginPath();
        points.forEach(([x, y], i) =>
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
        );
        for (let k = 20; k >= 0; k--) {
          const [x, y] = points[k];
          ctx.lineTo(x + Math.sin((k / 20) * Math.PI) * spread, y);
        }
        ctx.closePath();
        const shade = ctx.createLinearGradient(0, top, 0, base);
        shade.addColorStop(0, ink(strength * 0.14));
        shade.addColorStop(0.65, ink(strength * 0.055));
        shade.addColorStop(1, ink(0));
        ctx.fillStyle = shade;
        ctx.fill();
      }
    // Dry hemp-fibre texture: interrupted strokes descend along each rock face.
    const strokes = detail ? 1250 : 100;
    for (let j = 0; j < strokes; j++) {
      const t = random();
      const top = ridge(t),
        depth = base - top;
      const start = random() * 0.85;
      const len = between(0.03, 0.3);
      const points = [];
      const bias = between(-1, 1);
      for (let k = 0; k < 12; k++) {
        const p = start + (len * k) / 11;
        const x =
          left +
          t * span +
          (noise(p * 8 + t * 30, phase) * 12 + bias * p * 32) *
            Math.sin(Math.PI * t);
        points.push([x, top + depth * p + noise(k * 0.8, t * 18) * 1.4]);
      }
      const fade = Math.max(0, 1 - start * 1.15);
      brush(points, strength * between(0.06, 0.36) * fade, between(0.35, 1.1));
    }
    // Fractured structural folds, in groups rather than uniform contour bands.
    if (detail)
      for (let j = 0; j < 34; j++) {
        const t = (j + 0.4) / 35;
        const top = ridge(t);
        const points = [];
        const end = between(0.35, 0.94);
        for (let k = 0; k < 24; k++) {
          const p = (k / 23) * end;
          points.push([
            left +
              t * span +
              Math.sin(p * 4 + t * 12) * p * 26 +
              noise(p * 14, t * 60) * 2,
            top + (base - top) * p,
          ]);
        }
        brush(points, strength * between(0.11, 0.27), between(0.7, 1.8));
      }
    // Tiny ink deposits and vegetation stippling gather on ledges.
    for (let j = 0; j < (detail ? 1800 : 180); j++) {
      const t = random(),
        x = left + span * t,
        y = ridge(t) + (base - ridge(t)) * Math.pow(random(), 1.7);
      const fade = Math.max(0, (base - y) / elevation);
      ctx.fillStyle = ink(strength * fade * between(0.08, 0.65));
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        between(0.4, 2.1),
        between(0.3, 1),
        between(-0.4, 0.4),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
    // Broken brush outline stops before the mist-veiled foot.
    for (let i = 5; i < count - 5; i += 3) {
      const fade = Math.min(1, (base - contour[i][1]) / (elevation * 0.25));
      brush(
        contour.slice(i, i + 3),
        strength * 0.42 * fade,
        detail ? 0.9 : 0.5,
      );
    }
    return ridge;
  }

  // Compose in normalized scene coordinates; portrait gets its own mountain arrangement.
  if (portrait) {
    mountain(W * 0.2, H * 0.5, W * 1.1, H * 0.33, 0.18, 2, false);
    mountain(W * 0.84, H * 0.6, W * 0.95, H * 0.21, 0.15, 4, false);
    mountain(W * 0.44, H * 0.63, W * 0.95, H * 0.42, 0.31, 1, false);
    mountain(W * 0.14, H * 0.68, W * 0.98, H * 0.52, 0.86, 2.7);
    mountain(W * 0.42, H * 0.72, W * 0.61, H * 0.24, 0.63, 4.2);
  } else {
    mountain(W * 0.43, H * 0.57, W * 0.88, H * 0.45, 0.13, 3, false);
    mountain(W * 0.88, H * 0.65, W * 0.58, H * 0.25, 0.14, 2, false);
    mountain(W * 0.35, H * 0.62, W * 0.72, H * 0.6, 0.28, 1.8, false);
    mountain(W * 0.23, H * 0.7, W * 0.64, H * 0.76, 0.86, 2.3);
    mountain(W * 0.48, H * 0.71, W * 0.38, H * 0.43, 0.56, 3.8);
  }

  function pine(x, y, size, lean = -0.3, alpha = 0.75) {
    const trunk = [];
    for (let i = 0; i <= 18; i++) {
      const t = i / 18;
      trunk.push([
        x + lean * size * t + Math.sin(t * 4) * size * 0.075,
        y - size * t,
      ]);
    }
    for (let i = 0; i < 18; i++)
      brush(trunk.slice(i, i + 2), alpha, size * 0.022 * (1 - i / 21));
    // Branches taper into asymmetrical horizontal umbrellas of needles.
    for (let i = 5; i <= 18; i += 2) {
      const t = i / 18;
      const [bx, by] = trunk[i];
      const side = i % 4 === 1 ? -1 : 1;
      const length = size * (0.3 - t * 0.12) * between(0.7, 1.3);
      const ex = bx + side * length,
        ey = by - size * 0.055;
      brush(
        [
          [bx, by],
          [bx + side * length * 0.45, by - size * 0.015],
          [ex, ey],
        ],
        alpha * 0.8,
        Math.max(0.5, size * 0.009),
      );
      const tufts = size > 35 ? 22 : 7;
      for (let j = 0; j < tufts; j++) {
        const tx = ex + between(-0.14, 0.14) * size,
          ty = ey + between(-0.052, 0.018) * size;
        for (let n = 0; n < 16; n++) {
          const angle = between(Math.PI * 0.95, Math.PI * 2.05),
            r = between(0.022, 0.068) * size;
          line(
            [
              [tx, ty],
              [tx + Math.cos(angle) * r, ty + Math.sin(angle) * r],
            ],
            ink(alpha * between(0.3, 0.8)),
            Math.max(0.32, size * 0.003),
          );
        }
      }
    }
  }
  function rock(x, y, w, h, alpha) {
    const pts = [
      [x - w * 0.5, y],
      [x - w * 0.4, y - h * 0.7],
      [x - w * 0.1, y - h],
      [x + w * 0.33, y - h * 0.83],
      [x + w * 0.55, y - h * 0.26],
      [x + w * 0.5, y],
    ];
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
    const wash = ctx.createLinearGradient(x - w * 0.5, y - h, x + w * 0.5, y);
    wash.addColorStop(0, `rgba(63,75,58,${alpha * 0.3})`);
    wash.addColorStop(0.7, `rgba(63,75,58,${alpha * 0.18})`);
    wash.addColorStop(1, "rgba(80,90,70,0)");
    ctx.fillStyle = wash;
    ctx.fill();
    brush(pts, alpha * 0.58, 1.3);
    for (let i = 0; i < 35; i++) {
      const t = random(),
        px = x - w * 0.3 + t * w * 0.63,
        py = y - h * 0.8 + random() * h * 0.6;
      brush(
        [
          [px, py],
          [px + noise(i) * w * 0.08, py + h * between(0.06, 0.23)],
        ],
        alpha * between(0.12, 0.4),
        0.55,
      );
    }
  }
  // Small trees at the foot put the mountain scale in perspective.
  for (let i = 0; i < 32; i++) {
    const x = W * (portrait ? between(0.02, 0.48) : between(0.12, 0.52));
    const y = H * (portrait ? between(0.674, 0.708) : between(0.672, 0.708));
    pine(x, y, between(7, 20), between(-0.2, 0.2), 0.24);
  }
  // A nearly lost roof, nestled between the lower rocks.
  const px = W * (portrait ? 0.35 : 0.39),
    py = H * 0.71,
    ps = portrait ? 13 : 16;
  brush(
    [
      [px - ps, py],
      [px - ps * 0.8, py - ps * 0.12],
      [px, py - ps * 0.62],
      [px + ps * 0.8, py - ps * 0.12],
      [px + ps, py],
    ],
    0.48,
    0.9,
  );
  line(
    [
      [px - ps * 0.68, py],
      [px - ps * 0.68, py + ps * 0.6],
      [px + ps * 0.65, py + ps * 0.6],
      [px + ps * 0.65, py],
    ],
    ink(0.32),
    0.7,
  );
  line(
    [
      [px, py],
      [px, py + ps * 0.6],
    ],
    ink(0.24),
    0.5,
  );

  // The river is mostly untouched paper: only a few horizontal water strokes.
  for (let i = 0; i < 115; i++) {
    const x = W * between(0.12, 0.96),
      y = H * between(0.73, 0.96),
      len = between(4, 48);
    line(
      [
        [x, y],
        [x + len * 0.4, y - 0.5],
        [x + len, y],
      ],
      ink(between(0.018, 0.07)),
      between(0.4, 0.8),
    );
  }
  // Foreground promontory and the old pines anchor the empty river.
  const shore = H * (portrait ? 0.9 : 0.91);
  mountain(W * 0.04, shore, W * (portrait ? 0.83 : 0.63), H * 0.12, 0.76, 2.5);
  for (let i = 0; i < 12; i++)
    rock(
      W * between(-0.02, portrait ? 0.31 : 0.26),
      shore + between(-12, 12),
      between(30, 95),
      between(16, 37),
      0.5,
    );
  pine(W * 0.09, shore - 20, H * (portrait ? 0.145 : 0.27), 0.24, 0.85);
  pine(W * 0.18, shore - 10, H * (portrait ? 0.11 : 0.19), -0.28, 0.78);
  pine(W * 0.045, shore - 25, H * (portrait ? 0.09 : 0.16), -0.35, 0.66);
  // Far bank, deliberately pale and low.
  mountain(W * 1.03, H * 0.785, W * 0.37, H * 0.05, 0.22, 4, false);
  for (let i = 0; i < 9; i++)
    pine(W * between(0.91, 1.06), H * 0.78, between(8, 19), -0.15, 0.18);

  // A solitary boat and its reflection are drawn with just a handful of strokes.
  const bx = W * (portrait ? 0.64 : 0.69),
    by = H * (portrait ? 0.815 : 0.805),
    bs = portrait ? 1 : 1.15;
  ctx.save();
  ctx.translate(bx, by);
  ctx.scale(bs, bs);
  ctx.fillStyle = ink(0.73);
  ctx.beginPath();
  ctx.moveTo(-24, -2);
  ctx.quadraticCurveTo(0, 6, 25, -3);
  ctx.quadraticCurveTo(14, 8, -10, 6);
  ctx.closePath();
  ctx.fill();
  brush(
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
  // Two distant birds, each a single bent ink line.
  for (let i = 0; i < 2; i++) {
    const x = W * (0.62 + i * 0.025),
      y = H * (0.49 - i * 0.012),
      r = portrait ? 2.5 : 3;
    brush(
      [
        [x - r, y - 1],
        [x, y],
        [x + r, y - 1.5],
      ],
      0.32,
      0.65,
    );
  }
  return canvas;
}
