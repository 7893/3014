// One rightward river crossing. Its right-edge arrival can later hand off to another scene.
const START = 0.4;
const END = 1.08;
const SPEED = 0.014;
const smooth = (value) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export function boatMotion(time, center) {
  const distance = (center[0] - START + time * SPEED) % (END - START);
  const x = START + distance;
  return {
    offset: [x - center[0], Math.sin(time * 1.05) * 0.0022],
    opacity: smooth(distance / 0.035),
  };
}
