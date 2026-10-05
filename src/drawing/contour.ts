import type { Curve, Points } from "./types.ts";
// Smooth, asymmetric silhouettes from authored knots; no periodic mountain waves.
export function contourAt(knots: Points, t: number) {
	if (t <= knots[0][0]) return knots[0][1];
	for (let i = 1; i < knots.length; i++) {
		const [end, b] = knots[i],
			[start, a] = knots[i - 1];
		if (t > end) continue;
		const u = (t - start) / (end - start);
		return a + (b - a) * u * u * (3 - 2 * u);
	}
	return knots.at(-1)![1];
}

export function silhouette(
	left: number,
	span: number,
	base: number | Curve,
	ridge: Curve,
	count = 160,
) {
	const path = new Path2D();
	const foot = typeof base === "function" ? base : () => base;
	path.moveTo(left, foot(0));
	for (let i = 0; i <= count; i++)
		path.lineTo(left + (span * i) / count, ridge(i / count));
	for (let i = count; i >= 0; i--)
		path.lineTo(left + (span * i) / count, foot(i / count));
	path.closePath();
	return path;
}
