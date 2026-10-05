import { FISH_COUNT, fishState } from "../../motion/fish.ts";
import { LEAP_DURATION, leapingFish } from "../../motion/fish-leap.ts";
export function updateFish(
	canvas: HTMLCanvasElement,
	time: number,
	fishData: Float32Array,
	rippleData: Float32Array,
) {
	const aspect = canvas.width / canvas.height;
	for (let i = 0; i < FISH_COUNT; i++) {
		const period = 13 + i * 3,
			age = (time + period - i * 3 - 2) % period,
			position = fishState(
				time - age + (i === 0 ? LEAP_DURATION : 0),
				i,
				aspect,
			);
		fishData.set(
			i === 0 ? leapingFish(time, age, aspect) : fishState(time, i, aspect),
			i * 4,
		);
		rippleData.set(
			[
				position[0],
				position[1],
				age,
				age < 4 ? Math.sin((Math.PI * age) / 4) * 0.65 : 0,
			],
			i * 4,
		);
	}
}
