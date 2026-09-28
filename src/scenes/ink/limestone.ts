import type { Brush } from "../../drawing/types.ts";
export function paintLimestone(
  tools: Brush,
  land: {
    left: number;
    span: number;
    base: number;
    elevation: number;
    strength: number;
    ridge: (t: number) => number;
  },
) {
  const { ctx, random, between, noise, ink, brush } = tools;
  const { left, span, base, elevation, strength, ridge } = land;
  // Pooling ink forms wooded shoulders around the pale limestone faces.
  for (let mass = 0; mass < 14; mass++) {
    const t = between(0.05, 0.95),
      x = left + span * t,
      top = ridge(t);
    const y = top + (base - top) * between(0.08, 0.75),
      r = span * between(0.08, 0.2);
    const wash = ctx.createRadialGradient(x, y, 0, x, y, r);
    wash.addColorStop(0, ink(strength * 0.09));
    wash.addColorStop(1, ink(0));
    ctx.fillStyle = wash;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // Pale exposed faces interrupt the vegetation instead of covering every peak
  // in identical vertical fibres. All pigment stays clipped to its own mountain.
  for (let face = 0; face < 7; face++) {
    const t = between(0.18, 0.8),
      top = ridge(t),
      depth = base - top;
    const width = span * between(0.035, 0.14),
      x = left + span * t;
    ctx.beginPath();
    ctx.moveTo(x, top + depth * 0.12);
    ctx.bezierCurveTo(
      x - width,
      top + depth * 0.38,
      x + width * 0.6,
      top + depth * 0.68,
      x - width * 0.4,
      base,
    );
    ctx.lineTo(x + width, base);
    ctx.bezierCurveTo(
      x + width * 1.5,
      top + depth * 0.6,
      x + width * 0.3,
      top + depth * 0.32,
      x,
      top + depth * 0.12,
    );
    ctx.fillStyle = `rgba(234,228,208,${strength * between(0.12, 0.3)})`;
    ctx.fill();
  }
  const density = strength > 0.4 ? 95 : 28;
  for (let i = 0; i < density; i++) {
    const t = between(0.07, 0.93),
      top = ridge(t),
      depth = base - top;
    const start = random() * 0.65,
      length = between(0.05, 0.26);
    const points = Array.from({ length: 9 }, (_, j) => {
      const q = start + (j / 8) * length;
      return [
        left + t * span + noise(q * 9, t * 33) * span * 0.022,
        top + depth * q,
      ];
    });
    brush(points, strength * between(0.07, 0.22), between(0.5, 1.2));
  }
  // Broken horizontal limestone bedding, softened by pockets of foliage.
  for (let i = 0; i < density / 3; i++) {
    const t = between(0.12, 0.88),
      top = ridge(t),
      q = between(0.25, 0.85);
    const x = left + t * span,
      y = top + (base - top) * q;
    brush(
      [
        [x, y],
        [x + span * 0.025, y - 1],
        [x + span * 0.07, y + 2],
      ],
      strength * 0.12,
      0.6,
    );
  }
  for (let i = 0; i < density * 9; i++) {
    const t = random(),
      q = random(),
      top = ridge(t);
    // Clusters follow ledges; large untouched patches retain the paper light.
    if (noise(t * 13, q * 17) < -0.12 || q > 0.94) continue;
    const x = left + t * span,
      y = top + (base - top) * q;
    const fade = Math.min(1, (base - y) / (elevation * 0.18));
    ctx.fillStyle = ink(strength * fade * between(0.08, 0.35));
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      between(0.7, 2.5),
      between(0.5, 1.6),
      -0.25,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}
