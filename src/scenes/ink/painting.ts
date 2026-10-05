import { createBrush } from "../../drawing/brush.ts";
import { canvasLayer } from "../../drawing/canvas.ts";
import type { Brush } from "../../drawing/types.ts";
import { compositions } from "./composition.ts";
import { paintKarst } from "./karst.ts";
import { paintPaper } from "./paper.ts";
import { paintRiverbank, paintSettlement } from "./riverbank.ts";
import { paintBamboo, paintBroadleaf } from "./vegetation.ts";

export function createInk(width: number, height: number) {
	const portrait = width / height < 0.85,
		W = portrait ? 760 : 1600;
	const H = (W * height) / width,
		layers: Record<string, HTMLCanvasElement> = {};
	const composition = compositions[portrait ? "portrait" : "landscape"];
	function layer(name: string, seed: number, paint: (tools: Brush) => void) {
		const { canvas, ctx } = canvasLayer(width, height, W);
		paint(createBrush(ctx, seed));
		layers[name] = canvas;
	}
	layer("paper", 101, (tools: Brush) => paintPaper(tools, W, H));
	for (const [index, name] of (["far", "middle", "near"] as const).entries())
		layer(name, 202 + index * 101, (tools: Brush) => {
			for (const peak of composition[name]) paintKarst(tools, W, H, peak);
			if (name === "near") paintSettlement(tools, W, H);
		});
	layer("shore", 505, (tools: Brush) => paintRiverbank(tools, W, H, portrait));
	layer("foliage", 606, (tools: Brush) => {
		const height = Math.min(H * 0.23, W * 0.38);
		paintBroadleaf(tools, W * 0.022, H * 0.894, height * 0.53, 0.65);
		paintBamboo(tools, W * 0.075, H * 0.895, height);
		paintBamboo(tools, W * 0.15, H * 0.905, height * 0.64);
	});
	return { layers, width, height, portrait };
}
