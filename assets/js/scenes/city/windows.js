// Separate room identifiers keep every pixel of a window on the same schedule.
export function roomMarker(ctx) {
  let id = 0;
  return (x, y, width, height, floor) => {
    const room = 1 + ((++id * 73) % 254);
    const row = 1 + ((floor * 47) % 254);
    ctx.fillStyle = `rgb(${room},${row},0)`;
    ctx.fillRect(x, y, width, height);
  };
}
