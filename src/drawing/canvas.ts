import type { Points } from "./types.ts";
export function glow(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	r: number,
	color: string,
) {
	const g = ctx.createRadialGradient(x, y, 0, x, y, r);
	g.addColorStop(0, color);
	g.addColorStop(1, "transparent");
	ctx.fillStyle = g;
	ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
export function stroke(
	ctx: CanvasRenderingContext2D,
	points: Points,
	color: string,
	width = 1,
) {
	ctx.beginPath();
	points.forEach(([x, y], i: number) =>
		i ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
	);
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.stroke();
}

export function seededRandom(seed: number) {
	return () =>
		(seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
}
export function canvasLayer(width: number, height: number, W: number) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas 2D unavailable");
	ctx.scale(width / W, width / W);
	return { canvas, ctx };
}
