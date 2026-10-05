export const FISH_COUNT = 3;

// Each fish follows its own shallow-water path, slowing down between strokes.
export function fishState(time: number, index: number, aspect: number) {
	const phase = index * 2.17;
	const t = time * (0.2 + index * 0.025) + phase;
	const travel = t + 0.48 * Math.sin(t * 0.8);
	const x = 0.64 + index * 0.06 + 0.105 * Math.sin(travel);
	const y = 0.865 + index * 0.018 + 0.022 * Math.sin(travel * 1.65 + phase);
	const dx = 0.105 * Math.cos(travel) * aspect;
	const dy = 0.022 * 1.65 * Math.cos(travel * 1.65 + phase);
	const surface = 0.5 + 0.5 * Math.sin(time * 0.31 + phase);
	return [x, y, Math.atan2(dy, dx), 0.2 + 0.36 * surface * surface];
}
