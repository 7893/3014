// Separate room identifiers keep every pixel of a window on the same schedule.
export function roomMarker(ctx: CanvasRenderingContext2D) {
	let id = 0;
	return (
		x: number,
		y: number,
		width: number,
		height: number,
		floor: number,
	) => {
		const room = 1 + ((++id * 73) % 254);
		const row = 1 + ((floor * 47) % 254);
		ctx.fillStyle = `rgb(${room},${row},0)`;
		ctx.fillRect(x, y, width, height);
	};
}
