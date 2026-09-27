export function createPines(tools) {
  const { ctx, random, between, ink, noise, line, brush } = tools;
  function pine(x, y, size, lean = -0.3, alpha = 0.8) {
    const trunk = [];
    const phase = between(0, 6);
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      trunk.push([
        x + size * (lean * t + Math.sin(t * 4.4 + phase) * 0.045 * t),
        y - size * t,
      ]);
    }
    for (let i = 0; i < 24; i++) {
      const width = Math.max(0.35, size * 0.026 * Math.pow(1 - i / 27, 1.5));
      brush(trunk.slice(i, i + 2), alpha, width);
      if (size > 40)
        for (let k = 0; k < 3; k++) {
          const [px, py] = trunk[i];
          line(
            [
              [px + between(-1, 1) * width, py],
              [px + between(-1, 1) * width, py - size * 0.028],
            ],
            ink(alpha * 0.3),
            0.4,
          );
        }
    }
    function crown(cx, cy, r) {
      // Different fans overlap into a broad, irregular pine canopy.
      for (let j = 0; j < (size > 35 ? 15 : 4); j++) {
        const tx = cx + between(-r, r),
          ty = cy + between(-r * 0.21, r * 0.13);
        const length = between(0.21, 0.45) * r;
        for (let n = 0; n < 13; n++) {
          const angle =
            Math.PI * (0.97 + (n / 12) * 1.03) + between(-0.12, 0.12);
          line(
            [
              [tx, ty],
              [tx + Math.cos(angle) * length, ty + Math.sin(angle) * length],
            ],
            ink(alpha * between(0.35, 0.83)),
            size > 40 ? 0.6 : 0.32,
          );
        }
      }
    }
    const branchCount = size > 40 ? 9 : 5;
    for (let j = 0; j < branchCount; j++) {
      const t = 0.3 + (j / (branchCount - 1)) * 0.66;
      const [bx, by] = trunk[Math.floor(t * 24)];
      const side = j % 2 ? -1 : 1;
      const length = size * between(0.17, 0.29) * (1 - t * 0.45);
      const elbow = [
        bx + side * length * 0.42,
        by + size * between(-0.012, 0.024),
      ];
      const tip = [bx + side * length, by - size * between(0.025, 0.075)];
      brush(
        [[bx, by], elbow, tip],
        alpha * 0.83,
        Math.max(0.35, size * 0.01 * (1 - t * 0.5)),
      );
      for (let k = 0; k < 3; k++) {
        const ratio = 0.45 + k * 0.26;
        const ax = elbow[0] + (tip[0] - elbow[0]) * ratio;
        const ay = elbow[1] + (tip[1] - elbow[1]) * ratio;
        const tx = ax + side * size * between(0.025, 0.065),
          ty = ay - size * between(0.035, 0.075);
        brush(
          [
            [ax, ay],
            [tx, ty],
          ],
          alpha * 0.75,
          Math.max(0.3, size * 0.003),
        );
        crown(tx, ty, size * between(0.055, 0.1));
      }
    }
    const top = trunk[24];
    crown(top[0], top[1], size * 0.08);
  }
  return pine;
}
