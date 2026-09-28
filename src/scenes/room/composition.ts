export function roomLayout(W: number, H: number) {
  const portrait = W / H < .85;
  return {
    window: { x: W * (portrait ? .29 : .36), y: H * (portrait ? .30 : .21),
      width: W * (portrait ? .42 : .35), height: Math.min(H * .40, W * .76) },
    couple: { x: W * (portrait ? .45 : .49), y: H * .80,
      size: Math.min(H * .31, W * .27) },
    candle: { x: W * .20, y: H * .74 },
    floor: H * .79,
  };
}
