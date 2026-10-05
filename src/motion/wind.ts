// Damped responses share one gust; foliage follows faster than the trunk.
export function createWind() {
	let time = 0,
		drift = 0;
	const trunk = { x: 0, v: 0 },
		leaf = { x: 0, v: 0 };
	const value = new Float32Array(4);
	function spring(
		body: { x: number; v: number },
		target: number,
		frequency: number,
		damping: number,
		dt: number,
	) {
		body.v +=
			(frequency * frequency * (target - body.x) -
				2 * damping * frequency * body.v) *
			dt;
		body.x += body.v * dt;
	}
	function advance(dt: number) {
		const steps = Math.max(1, Math.ceil(dt * 120)),
			h = dt / steps;
		for (let i = 0; i < steps; i++) {
			time += h;
			const gust =
				0.62 * Math.sin(time * 0.34) +
				0.28 * Math.sin(time * 0.77 + 0.4) +
				0.1 * Math.sin(time * 1.39);
			spring(trunk, gust, 2.1, 0.9, h);
			spring(leaf, gust, 3.8, 0.65, h);
			drift += h * (0.75 + leaf.x * 0.25);
		}
		value.set([trunk.x, leaf.x, drift, 0.65 + Math.abs(leaf.v) * 0.18]);
		return value;
	}
	advance(0);
	return { advance, value };
}
