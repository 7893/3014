import { contourAt, silhouette } from "../../drawing/contour.js";

export function drawLandform(ctx, W, H, random, shape, colors, detail = 1) {
  const left = shape.left * W,
    span = shape.span * W;
  // Keep low tropical relief on narrow screens, rather than stretching hills.
  const relief = Math.min(H, W / 1.35);
  const base = shape.base * H,
    height = shape.height * relief;
  const shore = (t) =>
    base + (shape.shore ? relief * contourAt(shape.shore, t) : 0);
  const ridge = (t) =>
    shore(t) -
    height *
      Math.max(
        0,
        contourAt(shape.profile, t) +
          Math.sin(t * Math.PI) *
            (0.012 * Math.sin(t * 73) + 0.009 * Math.sin(t * 139)),
      );
  const path = silhouette(left, span, shore, ridge);
  ctx.save();
  ctx.clip(path);
  const wash = ctx.createLinearGradient(left, base - height, left + span, base);
  colors.forEach((color, i) =>
    wash.addColorStop(i / (colors.length - 1), color),
  );
  ctx.fillStyle = wash;
  ctx.fill(path);
  for (let fold = 0; fold < 9; fold++) {
    const t = random(),
      x = left + span * t,
      top = ridge(t);
    const shade = ctx.createLinearGradient(x, top, x + span * 0.15, base);
    shade.addColorStop(0, "rgba(30,66,50,.11)");
    shade.addColorStop(1, "rgba(151,169,109,0)");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.bezierCurveTo(
      x - span * 0.06,
      top + height * 0.4,
      x + span * 0.13,
      base,
      x + span * 0.07,
      base,
    );
    ctx.lineTo(x + span * 0.22, base);
    ctx.closePath();
    ctx.fill();
  }
  // Interlocking broadleaf crowns follow the slope rather than blurry circles.
  for (let i = 0; i < 1200 * detail; i++) {
    const t = random(),
      top = ridge(t),
      q = random();
    const x = left + t * span,
      y = top + (shore(t) - top) * q;
    const radius = (1 + random() * 2.4) * detail;
    ctx.fillStyle = i % 3 ? "rgba(24,64,46,.065)" : "rgba(191,198,125,.08)";
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * 0.55, -0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  return { left, span, base, ridge, shore };
}
