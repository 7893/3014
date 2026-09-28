export function roomLayout(W: number, H: number) {
  const portrait = W / H < .85;
  return {
    window: { x: W * (portrait ? .28 : .48), y: H * .20,
      width: W * (portrait ? .61 : .36), height: Math.min(H * .44, W * .62) },
    couple: { x: W * (portrait ? .45 : .49), y: H * .80,
      size: Math.min(H * .31, W * .27) },
    candle: { x: W * .20, y: H * .74 },
    floor: H * .79,
  };
}
