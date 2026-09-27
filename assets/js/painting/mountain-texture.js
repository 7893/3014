export function paintMountainTexture(
  tools,
  { ridge, left, span, base, elevation, strength, phase, detail },
) {
  const { ctx, random, between, ink, noise, line, brush } = tools;
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
      points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
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
}
