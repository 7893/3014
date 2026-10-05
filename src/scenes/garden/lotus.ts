import { stroke } from "../../drawing/canvas.ts";

export function lotus(
	c: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
) {
	const height = size * 1.9;
	c.save();
	c.translate(x, y);
	c.beginPath();
	c.moveTo(0, 0);
	c.bezierCurveTo(
		-size * 0.15,
		-height * 0.4,
		size * 0.16,
		-height * 0.7,
		0,
		-height,
	);
	c.strokeStyle = "#617d59";
	c.lineWidth = 2;
	c.stroke();
	for (let tier = 0; tier < 3; tier++) {
		for (let petal = -3 + tier; petal <= 3 - tier; petal++) {
			c.save();
			c.translate(0, -height);
			c.rotate(petal * 0.29);
			const length = size * (1.02 - tier * 0.14),
				spread = size * (0.32 - tier * 0.055);
			const shade = c.createLinearGradient(0, -length, 0, size * 0.25);
			shade.addColorStop(0, tier ? "#f0d4c6" : "#c98792");
			shade.addColorStop(0.55, "#ead0be");
			shade.addColorStop(1, "#b7948e");
			c.beginPath();
			c.moveTo(0, size * 0.18);
			c.bezierCurveTo(
				-spread,
				-length * 0.12,
				-spread,
				-length * 0.68,
				0,
				-length,
			);
			c.bezierCurveTo(
				spread,
				-length * 0.68,
				spread,
				-length * 0.12,
				0,
				size * 0.18,
			);
			c.fillStyle = shade;
			c.fill();
			stroke(
				c,
				[
					[0, size * 0.1],
					[0, -length * 0.76],
				],
				"#fcdfd055",
				0.6,
			);
			c.restore();
		}
	}
	c.fillStyle = "#ccb77b";
	c.beginPath();
	c.ellipse(
		0,
		-height + size * 0.06,
		size * 0.19,
		size * 0.1,
		0,
		0,
		Math.PI * 2,
	);
	c.fill();
	c.restore();
}
