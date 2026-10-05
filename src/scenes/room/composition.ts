export function roomLayout(W: number, H: number) {
	const portrait = W / H < 0.85;
	return {
		window: {
			x: W * (portrait ? 0.29 : 0.36),
			y: H * (portrait ? 0.3 : 0.21),
			width: W * (portrait ? 0.42 : 0.35),
			height: Math.min(H * 0.4, W * 0.76),
		},
		couple: {
			x: W * (portrait ? 0.45 : 0.49),
			y: H * 0.8,
			size: Math.min(H * 0.31, W * 0.27),
		},
		candle: { x: W * 0.2, y: H * 0.74 },
		floor: H * 0.79,
	};
}
