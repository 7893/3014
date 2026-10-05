import { seededRandom, stroke } from "../../drawing/canvas.ts";
import { corridor, courtyardWall, stoneBridge } from "./courtyard.ts";
import { hall, rock, roof } from "./structures.ts";

export function architecture(
	c: CanvasRenderingContext2D,
	W: number,
	H: number,
) {
	const base = H * 0.655,
		unit = Math.min(W, H),
		random = seededRandom(733);
	// Receding white residences, linked by a dark-tiled waterside gallery.
	c.save();
	c.globalAlpha = 0.54;
	hall(c, W * 0.29, base - H * 0.055, W * 0.29, unit * 0.14);
	c.restore();
	courtyardWall(c, W, H);
	corridor(c, W * 0.35, base - H * 0.018, W * 0.34, unit * 0.1);
	// Main study: a low domestic hall rather than a symmetrical palace facade.
	hall(c, W * 0.025, base, W * 0.3, unit * 0.2);
	const gx = W * 0.012,
		gy = base - unit * 0.19,
		gw = W * 0.055;
	c.fillStyle = "#edece0";
	c.beginPath();
	c.moveTo(gx, base);
	c.lineTo(gx, gy);
	c.lineTo(gx + gw * 0.25, gy - unit * 0.075);
	c.lineTo(gx + gw * 0.78, gy - unit * 0.075);
	c.lineTo(gx + gw, gy);
	c.lineTo(gx + gw, base);
	c.closePath();
	c.fill();
	stroke(
		c,
		[
			[gx, gy],
			[gx + gw * 0.25, gy - unit * 0.075],
			[gx + gw * 0.78, gy - unit * 0.075],
			[gx + gw, gy],
		],
		"#586762",
		4,
	);
	// A small pavilion at the turn of the gallery, open to the lotus pond.
	const px = W * 0.89,
		py = base - H * 0.008,
		pw = W * 0.14,
		ph = unit * 0.14;
	for (const side of [-0.36, 0.36])
		stroke(
			c,
			[
				[px + pw * side, py],
				[px + pw * side, py - ph],
			],
			"#615d49",
			4,
		);
	stroke(
		c,
		[
			[px - pw * 0.5, py],
			[px + pw * 0.5, py],
		],
		"#a5b09b",
		6,
	);
	roof(c, px - pw / 2, py - ph, pw, pw * 0.23);
	// Low mossy retaining wall and irregular stone joints establish the waterline.
	c.fillStyle = "#829688";
	c.fillRect(0, base, W, H * 0.011);
	stroke(
		c,
		[
			[0, base],
			[W, base],
		],
		"#dddcca",
		2,
	);
	for (let i = 0; i < 38; i++) {
		const x = (W * i) / 37;
		stroke(
			c,
			[
				[x, base + 1],
				[x + 2, base + H * 0.009],
			],
			"#526e6355",
			1,
		);
	}
	stoneBridge(c, W * 0.54, H * 0.68, W * 0.23, unit * 0.045);
	rock(c, W * 0.77, base + H * 0.012, unit * 0.072);
	rock(c, W * 0.82, base + H * 0.014, unit * 0.039);
	for (let i = 0; i < 500; i++) {
		c.fillStyle = "#708c631c";
		c.fillRect(
			random() * W,
			base - random() * unit * 0.015,
			1 + random() * 5,
			1,
		);
	}
}
