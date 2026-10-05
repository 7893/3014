import { canvasLayer } from "./canvas.ts";

/** Named painting layers share one design space; Pixi owns their GPU lifetime. */
export function paintingLayers<const K extends string>(
	width: number,
	height: number,
	names: readonly K[],
) {
	const portrait = width / height < 0.85,
		W = portrait ? 760 : 1600,
		H = (W * height) / width;
	const layers = {} as Record<string, HTMLCanvasElement>;
	const contexts = {} as Record<K, CanvasRenderingContext2D>;
	for (const name of names) {
		const { canvas, ctx } = canvasLayer(width, height, W);
		layers[name] = canvas;
		contexts[name] = ctx;
	}
	return { layers, contexts, W, H, portrait };
}
