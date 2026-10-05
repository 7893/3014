import { seededRandom } from "../../drawing/canvas.ts";
import { lotus } from "./lotus.ts";

export function foliage(c: CanvasRenderingContext2D, W: number, H: number) {
	const random = seededRandom(1209);
	c.beginPath();
	c.moveTo(-20, H * 0.06);
	c.bezierCurveTo(W * 0.05, H * 0.19, W * 0.15, H * 0.16, W * 0.34, H * 0.19);
	c.strokeStyle = "#4a6252";
	c.lineWidth = 7;
	c.stroke();
	for (let i = 0; i < 48; i++) {
		const x = random() * W * 0.34,
			y = H * (0.075 + 0.115 * (x / (W * 0.34)) ** 0.46);
		const length = H * (0.04 + random() * 0.19);
		c.beginPath();
		c.moveTo(x, y);
		c.quadraticCurveTo(x + 10, y + length * 0.7, x - 3, y + length);
		c.strokeStyle = "#63805a66";
		c.lineWidth = 0.8;
		c.stroke();
		for (let j = 0; j < 14; j++) {
			c.fillStyle = `rgba(75,109,68,${0.25 + random() * 0.35})`;
			c.beginPath();
			c.ellipse(
				x + Math.sin(j * 0.21) * 5,
				y + (length * j) / 14,
				2,
				6 + random() * 4,
				j % 2 ? 0.7 : -0.6,
				0,
				Math.PI * 2,
			);
			c.fill();
		}
	}
}

export function bank(c: CanvasRenderingContext2D, W: number, H: number) {
	const random = seededRandom(402),
		portrait = W / H < 0.85;
	// Large near-field pads frame a clear central boating channel.
	for (let i = 0; i < 22; i++) {
		const right = i > 10;
		const x = W * (right ? 0.83 + random() * 0.23 : -0.05 + random() * 0.24);
		const y = H * (0.94 + random() * 0.08),
			r = (portrait ? 43 : 62) * (0.6 + random() * 0.7);
		const shade = c.createLinearGradient(x, y - r, x, y + r);
		shade.addColorStop(0, "#9caf7b");
		shade.addColorStop(0.5, "#5e845b");
		shade.addColorStop(1, "#335f4e");
		c.beginPath();
		c.ellipse(x, y, r, r * 0.37, -0.12, 0.17, Math.PI * 1.94);
		c.lineTo(x, y);
		c.closePath();
		c.fillStyle = shade;
		c.fill();
		for (let vein = 0; vein < 11; vein++) {
			const a = (vein * Math.PI * 2) / 11;
			c.beginPath();
			c.moveTo(x, y);
			c.quadraticCurveTo(
				x + Math.cos(a) * r * 0.4,
				y + Math.sin(a) * r * 0.12,
				x + Math.cos(a) * r * 0.9,
				y + Math.sin(a) * r * 0.33,
			);
			c.strokeStyle = "#c1c89244";
			c.lineWidth = 0.8;
			c.stroke();
		}
	}
	const size = portrait ? 46 : 61;
	lotus(c, W * 0.065, H * 0.97, size);
	lotus(c, W * 0.19, H * 1.025, size * 0.67);
	lotus(c, W * 0.905, H * 0.985, size * 1.13);
	lotus(c, W * 1.015, H * 0.945, size * 0.72);
}
