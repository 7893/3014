import type { Painting } from "../types.ts";
export function drawStaticRoom(ctx: CanvasRenderingContext2D, room: Painting) {
	for (const name of ["interior", "figures", "curtain"])
		ctx.drawImage(room.layers[name], 0, 0);
}
