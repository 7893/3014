import { stroke } from "../../drawing/canvas.ts";
import type { roomLayout } from "./composition.ts";

export function paintWindow(
	c: CanvasRenderingContext2D,
	win: ReturnType<typeof roomLayout>["window"],
) {
	const sky = c.createLinearGradient(0, win.y, 0, win.y + win.height);
	sky.addColorStop(0, "#172c43");
	sky.addColorStop(1, "#638085");
	c.fillStyle = sky;
	c.fillRect(win.x, win.y, win.width, win.height);
	c.save();
	c.beginPath();
	c.rect(win.x, win.y, win.width, win.height);
	c.clip();
	const mx = win.x + win.width * 0.69,
		my = win.y + win.height * 0.27,
		moon = win.width * 0.053;
	const halo = c.createRadialGradient(mx, my, moon, mx, my, moon * 5);
	halo.addColorStop(0, "#d7e5d23b");
	halo.addColorStop(1, "transparent");
	c.fillStyle = halo;
	c.fillRect(win.x, win.y, win.width, win.height);
	c.fillStyle = "#e2e4ce";
	c.beginPath();
	c.arc(mx, my, moon, 0, Math.PI * 2);
	c.fill();
	for (let row = 0; row < 3; row++) {
		c.beginPath();
		c.moveTo(win.x, win.y + win.height);
		for (let i = 0; i <= 30; i++) {
			const xx = win.x + (win.width * i) / 30;
			const yy =
				win.y +
				win.height * (0.78 + row * 0.07 - Math.sin(i * 0.34 + row) * 0.06);
			c.lineTo(xx, yy);
		}
		c.lineTo(win.x + win.width, win.y + win.height);
		c.closePath();
		c.fillStyle = ["#4d6d72", "#3f5d64", "#2c474f"][row];
		c.fill();
	}
	c.restore();
	c.strokeStyle = "#736656";
	c.lineWidth = 8;
	c.strokeRect(win.x, win.y, win.width, win.height);
	c.strokeStyle = "#af9c7355";
	c.lineWidth = 1.5;
	c.strokeRect(win.x - 7, win.y - 7, win.width + 14, win.height + 14);
	for (let i = 1; i < 4; i++)
		stroke(
			c,
			[
				[win.x + (win.width * i) / 4, win.y],
				[win.x + (win.width * i) / 4, win.y + win.height],
			],
			"#625d50",
			3,
		);
	stroke(
		c,
		[
			[win.x, win.y + win.height * 0.73],
			[win.x + win.width, win.y + win.height * 0.73],
		],
		"#625d50",
		3,
	);
}

export function paintCurtains(
	veil: CanvasRenderingContext2D,
	win: ReturnType<typeof roomLayout>["window"],
	floor: number,
) {
	for (const side of [0, 1]) {
		const x = win.x + win.width * side;
		const span = win.width * 0.16;
		veil.beginPath();
		veil.moveTo(x - span * 0.3, win.y - 14);
		veil.lineTo(x + span * 0.6, win.y - 14);
		veil.bezierCurveTo(
			x + span,
			win.y + win.height * 0.4,
			x + span * 0.3,
			floor - 30,
			x + span * 0.8,
			floor + 7,
		);
		veil.quadraticCurveTo(x, floor + 20, x - span * 0.3, floor + 5);
		veil.closePath();
		veil.fillStyle = "#ded3b943";
		veil.fill();
		for (let i = 0; i < 8; i++) {
			const xx = x + span * (i / 10 - 0.2);
			veil.beginPath();
			veil.moveTo(xx, win.y - 14);
			veil.bezierCurveTo(
				xx + span * 0.4,
				win.y + win.height * 0.4,
				xx - span * 0.2,
				floor - 50,
				xx + span * 0.3,
				floor + 7,
			);
			veil.strokeStyle = "#e3d9bf17";
			veil.lineWidth = 2;
			veil.stroke();
		}
	}
}
