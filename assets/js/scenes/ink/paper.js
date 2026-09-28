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
