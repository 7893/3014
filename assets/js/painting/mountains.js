import { paintMountainTexture } from "./mountain-texture.js";
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
    paintMountainTexture(tools, {
      ridge,
      left,
      span,
      base,
      elevation,
      strength,
      phase,
      detail,
    });
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
