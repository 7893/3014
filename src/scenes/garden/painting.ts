import { seededRandom } from "../../drawing/canvas.ts";
import { paintingLayers } from "../../drawing/layers.ts";
import { architecture } from "./architecture.ts";
import { bank, foliage } from "./foliage.ts";

export function createGarden(width: number, height: number) {
	const { layers, contexts, W, H, portrait } = paintingLayers(width, height, [
		"buildings",
		"foliage",
		"bank",
	]);
	const c = contexts.buildings,
		random = seededRandom(892);
	// Soft distant canopies behind the enclosure, leaving the inscription in open sky.
	for (let tree = 0; tree < 28; tree++) {
		const x = random() * W,
			y = H * (0.36 + random() * 0.12);
		const rw = 35 + random() * 70,
			rh = 25 + random() * 45;
		for (let leaf = 0; leaf < 120; leaf++) {
			const angle = random() * Math.PI * 2,
				radius = Math.sqrt(random());
			c.fillStyle = `rgba(101,133,94,${0.05 + random() * 0.1})`;
			c.beginPath();
			c.ellipse(
				x + Math.cos(angle) * radius * rw,
				y + Math.sin(angle) * radius * rh,
				2 + random() * 7,
				2 + random() * 4,
				angle,
				0,
				Math.PI * 2,
			);
			c.fill();
		}
	}
	architecture(c, W, H);
	foliage(contexts.foliage, W, H);
	bank(contexts.bank, W, H);
	return { layers, width, height, portrait };
}
