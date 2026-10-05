import { stroke } from "../../drawing/canvas.ts";

export function roof(
	c: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	rise: number,
) {
	const pigment = c.createLinearGradient(0, y - rise, 0, y + 12);
	pigment.addColorStop(0, "#556661");
	pigment.addColorStop(0.65, "#394d49");
	pigment.addColorStop(1, "#253d39");
	c.beginPath();
	c.moveTo(x - w * 0.09, y - 7);
	c.quadraticCurveTo(x + w * 0.03, y + 3, x + w * 0.21, y - rise);
	c.lineTo(x + w * 0.79, y - rise);
	c.quadraticCurveTo(x + w * 0.97, y + 3, x + w * 1.09, y - 7);
	c.lineTo(x + w * 1.05, y + 6);
	c.quadraticCurveTo(x + w * 0.5, y + 11, x - w * 0.05, y + 6);
	c.closePath();
	c.fillStyle = pigment;
	c.fill();
	c.save();
	c.clip();
	for (let i = 0; i < 54; i++) {
		const xx = x + (w * i) / 53;
		c.beginPath();
		c.moveTo(xx, y + 9);
		c.quadraticCurveTo(
			xx + (x + w / 2 - xx) * 0.11,
			y - rise * 0.25,
			xx + (x + w / 2 - xx) * 0.18,
			y - rise,
		);
		c.strokeStyle = i % 3 ? "#9cae9230" : "#192f3860";
		c.lineWidth = 0.8;
		c.stroke();
	}
	for (let i = 0; i < 8; i++)
		stroke(
			c,
			[
				[x, y - (rise * i) / 8],
				[x + w, y - (rise * i) / 8],
			],
			"#abbfa314",
			0.8,
		);
	c.restore();
	stroke(
		c,
		[
			[x - w * 0.05, y + 8],
			[x + w * 0.5, y + 12],
			[x + w * 1.05, y + 8],
		],
		"#a7b3a2",
		1.2,
	);
}

export function hall(
	c: CanvasRenderingContext2D,
	x: number,
	base: number,
	w: number,
	h: number,
	storeys = 1,
) {
	const plaster = c.createLinearGradient(x, base - h, x + w, base);
	plaster.addColorStop(0, "#f0eee0");
	plaster.addColorStop(1, "#bbc5b3");
	c.fillStyle = plaster;
	c.fillRect(x, base - h, w, h);
	const bays = 5;
	for (let floor = 0; floor < storeys; floor++) {
		const y = base - h + (floor * h) / storeys + 10,
			wh = h / storeys - 17;
		for (let bay = 0; bay < bays; bay++) {
			const bx = x + (w * (bay + 0.16)) / bays,
				bw = (w * 0.68) / bays;
			const light = c.createLinearGradient(bx, y, bx + bw, y + wh);
			light.addColorStop(0, "#304a43");
			light.addColorStop(1, "#798874");
			c.fillStyle = light;
			c.fillRect(bx, y, bw, wh);
			c.strokeStyle = "#6d6752";
			c.lineWidth = 2;
			c.strokeRect(bx, y, bw, wh);
			for (let k = 1; k < 5; k++)
				stroke(
					c,
					[
						[bx + (bw * k) / 5, y],
						[bx + (bw * k) / 5, y + wh],
					],
					"#b8b29266",
					0.7,
				);
			for (let k = 1; k < 5; k++) {
				const yy = y + (wh * k) / 5;
				stroke(
					c,
					[
						[bx, yy],
						[bx + bw, yy],
					],
					"#aaa88977",
					0.7,
				);
			}
		}
		stroke(
			c,
			[
				[x - 3, y + wh + 4],
				[x + w + 3, y + wh + 4],
			],
			"#556655",
			4,
		);
	}
	for (let i = 0; i <= bays; i++)
		stroke(
			c,
			[
				[x + (i * w) / bays, base - h],
				[x + (i * w) / bays, base],
			],
			"#756d57",
			3,
		);
	roof(c, x - 4, base - h, w + 8, w * 0.14);
	if (storeys > 1) roof(c, x - 2, base - h * 0.46, w + 4, w * 0.025);
	c.fillStyle = "#899b86";
	c.fillRect(x - 8, base, w + 16, 6);
	stroke(
		c,
		[
			[x - 8, base],
			[x + w + 8, base],
		],
		"#d6d5be",
		1.5,
	);
}

export function rock(
	c: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
) {
	c.save();
	c.translate(x, y);
	c.scale(size, size);
	const shade = c.createLinearGradient(-0.4, -1, 0.5, 0);
	shade.addColorStop(0, "#a2b1a0");
	shade.addColorStop(0.45, "#708b7a");
	shade.addColorStop(1, "#455e55");
	c.beginPath();
	c.moveTo(-0.52, 0);
	c.lineTo(-0.31, -0.21);
	c.lineTo(-0.42, -0.37);
	c.lineTo(-0.2, -0.49);
	c.lineTo(-0.22, -0.82);
	c.lineTo(0.03, -1.02);
	c.lineTo(0.29, -0.83);
	c.lineTo(0.18, -0.64);
	c.lineTo(0.4, -0.54);
	c.lineTo(0.32, -0.33);
	c.lineTo(0.57, -0.12);
	c.lineTo(0.49, 0.02);
	c.closePath();
	c.moveTo(-0.03, -0.69);
	c.ellipse(-0.03, -0.69, 0.09, 0.12, 0.3, 0, Math.PI * 2);
	c.moveTo(0.11, -0.35);
	c.ellipse(0.11, -0.35, 0.13, 0.07, -0.3, 0, Math.PI * 2);
	c.fillStyle = shade;
	c.fill("evenodd");
	stroke(
		c,
		[
			[-0.31, -0.19],
			[-0.1, -0.38],
			[-0.14, -0.51],
		],
		"#c1c9b266",
		0.015,
	);
	stroke(
		c,
		[
			[0.3, -0.49],
			[0.13, -0.58],
			[0.17, -0.76],
		],
		"#d3d8bb55",
		0.012,
	);
	c.restore();
}
