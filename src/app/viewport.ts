// Bound Canvas textures and GPU targets even on large, high-density displays.
export function viewportSize(maxSize = 4096) {
  const w = innerWidth,
    h = innerHeight;
  const dpr = Math.min(
    devicePixelRatio || 1,
    1.5,
    Math.sqrt(1800000 / (w * h)),
    maxSize / w,
    maxSize / h,
  );
  const width = Math.max(1, Math.round(w * dpr));
  const height = Math.max(1, Math.round(h * dpr));
  return { width, height, key: `${width}:${height}` };
}
