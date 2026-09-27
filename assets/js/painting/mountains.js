export function createMountains(tools) {
  const { ctx, random, between, ink, noise, line, brush } = tools;
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
    // Moss dots collect in shaded creases; dry flecks leave paper visible on ridges.
    if (detail)
      for (let j = 0; j < 75; j++) {
        const t = between(0.08, 0.92),
          top = ridge(t),
          depth = base - top;
        const fraction = between(0.02, 0.7),
          cx = left + t * span,
          cy = top + depth * fraction;
        const fade = Math.max(0, 1 - fraction * 1.25);
        for (let k = 0; k < between(6, 16); k++) {
          const x = cx + between(-8, 8),
            y = cy + between(-5, 6);
          ctx.fillStyle = ink(strength * fade * between(0.12, 0.36));
          ctx.beginPath();
          ctx.ellipse(
            x,
            y,
            between(0.6, 2.6),
            between(0.35, 1.3),
            -0.3,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
    if (detail)
      for (let j = 0; j < 240; j++) {
        const t = random(),
          top = ridge(t),
          q = between(0.02, 0.65),
          x = left + t * span,
          y = top + (base - top) * q;
        line(
          [
            [x, y],
            [x + between(-1, 2), y + between(1, 6)],
          ],
          "rgba(241,235,216,.20)",
          between(0.4, 0.9),
        );
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
  return { mountain, rock };
}
