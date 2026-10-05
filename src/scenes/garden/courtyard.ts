import { stroke } from "../../drawing/canvas.ts";
import { roof } from "./structures.ts";

export function courtyardWall(
	c: CanvasRenderingContext2D,
	W: number,
	H: number,
) {
	const base = H * 0.645,
		unit = Math.min(W, H),
		top = base - unit * 0.19;
	const shade = c.createLinearGradient(0, top, 0, base);
	shade.addColorStop(0, "#f2eee0");
	shade.addColorStop(1, "#c2caba");
	c.fillStyle = shade;
	c.beginPath();
	c.moveTo(W * 0.47, base);
	c.lineTo(W * 0.47, top);
	c.bezierCurveTo(
		W * 0.64,
		top + unit * 0.03,
		W * 0.72,
		top - unit * 0.035,
		W,
		top - unit * 0.025,
	);
	c.lineTo(W, base);
	c.closePath();
	c.fill();
	// Undulating dark coping and a round opening with a view into the inner garden.
	c.beginPath();
	c.moveTo(W * 0.47, top);
	c.bezierCurveTo(
		W * 0.64,
		top + unit * 0.03,
		W * 0.72,
		top - unit * 0.035,
		W,
		top - unit * 0.025,
	);
	c.strokeStyle = "#445e57";
	c.lineWidth = 5;
	c.stroke();
	const x = W * 0.735,
		r = unit * 0.075,
		y = base - r;
	c.save();
	c.beginPath();
	c.arc(x, y, r, 0, Math.PI * 2);
	c.clip();
	const garden = c.createLinearGradient(0, y - r, 0, base);
	garden.addColorStop(0, "#607e70");
	garden.addColorStop(1, "#acb9a0");
	c.fillStyle = garden;
	c.fillRect(x - r, y - r, r * 2, r * 2);
	c.beginPath();
	c.moveTo(x + r * 0.2, base);
	c.bezierCurveTo(
		x - r,
		y + r * 0.4,
		x + r * 0.7,
		y,
		x + r * 0.15,
		y - r * 0.4,
	);
	c.strokeStyle = "#dbd9bb";
	c.lineWidth = r * 0.23;
	c.stroke();
	for (let i = 0; i < 9; i++) {
		const bx = x - r * 0.94 + i * r * 0.11;
		stroke(
			c,
			[
				[bx, base],
				[bx + r * 0.1, y - r],
			],
			"#496c50",
			1.3,
		);
		for (let j = 0; j < 7; j++)
			stroke(
				c,
				[
					[bx, y - r + j * r * 0.24],
					[bx + r * 0.22, y - r + j * r * 0.24 - 4],
				],
				"#4f754e",
				2,
			);
	}
	c.restore();
	c.strokeStyle = "#aab5a6";
	c.lineWidth = 5;
	c.beginPath();
	c.arc(x, y, r + 2, 0, Math.PI * 2);
	c.stroke();
	for (const fx of [0.55, 0.94]) {
		const wx = W * fx,
			wy = top + unit * 0.085,
			wr = unit * 0.035;
		c.fillStyle = "#6e897b";
		c.beginPath();
		c.arc(wx, wy, wr, 0, Math.PI * 2);
		c.fill();
		c.save();
		c.clip();
		for (let k = -4; k <= 4; k++) {
			stroke(
				c,
				[
					[wx - wr, wy + (k * wr) / 3 - wr],
					[wx + wr, wy + (k * wr) / 3 + wr],
				],
				"#dadbca",
				1.3,
			);
			stroke(
				c,
				[
					[wx - wr, wy + (k * wr) / 3 + wr],
					[wx + wr, wy + (k * wr) / 3 - wr],
				],
				"#dadbca",
				1.3,
			);
		}
		c.restore();
	}
}

export function corridor(
	c: CanvasRenderingContext2D,
	x: number,
	base: number,
	w: number,
	h: number,
) {
	c.fillStyle = "#647e6b55";
	c.fillRect(x, base - h, w, h);
	for (let i = 0; i <= 7; i++) {
		const px = x + (w * i) / 7;
		stroke(
			c,
			[
				[px, base - h],
				[px, base],
			],
			"#655f4c",
			2.8,
		);
		if (i < 7) {
			stroke(
				c,
				[
					[px, base - h * 0.2],
					[px + w / 7, base - h * 0.2],
				],
				"#8b8d73",
				2,
			);
			stroke(
				c,
				[
					[px + w / 28, base - h * 0.2],
					[px + w / 28, base],
				],
				"#777e68",
				1.2,
			);
		}
	}
	roof(c, x, base - h, w, h * 0.26);
}

export function stoneBridge(
	c: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	rise: number,
) {
	c.save();
	c.translate(x, y);
	c.beginPath();
	c.moveTo(-w / 2, 0);
	c.quadraticCurveTo(0, -rise * 2.1, w / 2, 0);
	c.lineTo(w / 2, rise * 0.22);
	c.quadraticCurveTo(0, -rise * 1.05, -w / 2, rise * 0.22);
	c.closePath();
	c.fillStyle = "#b9c1ae";
	c.fill();
	c.strokeStyle = "#698275";
	c.lineWidth = 1;
	c.stroke();
	for (let i = 0; i <= 8; i++) {
		const t = i / 8,
			bx = (t - 0.5) * w,
			by = -4 * t * (1 - t) * rise;
		stroke(
			c,
			[
				[bx, by],
				[bx, by - rise * 0.43],
			],
			"#b8c2af",
			3,
		);
	}
	c.beginPath();
	c.moveTo(-w / 2, -rise * 0.4);
	c.quadraticCurveTo(0, -rise * 2.5, w / 2, -rise * 0.4);
	c.strokeStyle = "#d2d5bf";
	c.lineWidth = 3;
	c.stroke();
	c.restore();
}
