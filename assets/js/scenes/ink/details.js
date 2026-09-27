export function paintPaper(
  { ctx, random, between, line, ink },
  W,
  H,
  portrait,
) {
  const wash = ctx.createRadialGradient(
    W * 0.47,
    H * 0.38,
    0,
    W * 0.5,
    H * 0.5,
    Math.max(W, H) * 0.75,
  );
  wash.addColorStop(0, "#f4f0e4");
  wash.addColorStop(1, "#e4decd");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 14000; i++) {
    const x = random() * W,
      y = random() * H;
    line(
      [
        [x, y],
        [x + between(0.4, 2.2), y + between(-0.7, 0.7)],
      ],
      `rgba(102,91,65,${between(0.015, 0.055)})`,
      between(0.3, 0.7),
    );
  }
  for (let i = 0; i < 90; i++) {
    const x = W * between(0.15, 0.96),
      y = H * between(0.73, 0.96),
      length = between(5, 48);
    line(
      [
        [x, y],
        [x + length * 0.4, y - 0.5],
        [x + length, y],
      ],
      ink(between(0.018, 0.06)),
      0.6,
    );
  }
}
export function paintNear(
  { mountain, pine, brush, line, ink, between },
  W,
  H,
  portrait,
) {
  if (portrait) {
    mountain(W * 0.14, H * 0.68, W * 0.98, H * 0.52, 0.86, 2.7);
    mountain(W * 0.42, H * 0.72, W * 0.61, H * 0.24, 0.63, 4.2);
  } else {
    mountain(W * 0.23, H * 0.7, W * 0.64, H * 0.76, 0.86, 2.3);
    mountain(W * 0.48, H * 0.71, W * 0.38, H * 0.43, 0.56, 3.8);
  }
  for (let i = 0; i < 27; i++) {
    const t = between(0, 1),
      x = W * ((portrait ? 0.02 : 0.12) + t * (portrait ? 0.46 : 0.4));
    pine(x, H * (0.69 + Math.sin(i * 1.3) * 0.016), between(7, 15), -0.1, 0.19);
  }
  const x = W * (portrait ? 0.35 : 0.39),
    y = H * 0.71,
    s = portrait ? 13 : 16;
  brush(
    [
      [x - s, y],
      [x - s * 0.8, y - s * 0.12],
      [x, y - s * 0.62],
      [x + s * 0.8, y - s * 0.12],
      [x + s, y],
    ],
    0.5,
    0.9,
  );
  line(
    [
      [x - s * 0.68, y],
      [x - s * 0.68, y + s * 0.6],
      [x + s * 0.65, y + s * 0.6],
      [x + s * 0.65, y],
    ],
    ink(0.36),
    0.7,
  );
  line(
    [
      [x, y],
      [x, y + s * 0.6],
    ],
    ink(0.3),
    0.5,
  );
  for (let i = 0; i < 2; i++) {
    const bx = W * (0.62 + i * 0.025),
      by = H * (0.49 - i * 0.012),
      r = portrait ? 2.5 : 3;
    brush(
      [
        [bx - r, by - 1],
        [bx, by],
        [bx + r, by - 1.5],
      ],
      0.35,
      0.65,
    );
  }
}
