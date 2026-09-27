import { FISH_COUNT, fishState } from "../motion/fish.js";
export function updateFish(canvas, time, fishData, rippleData) {
  const aspect = canvas.width / canvas.height;
  for (let i = 0; i < FISH_COUNT; i++) {
    fishData.set(fishState(time, i, aspect), i * 4);
    const period = 13 + i * 3,
      age = (time + period - i * 3 - 2) % period,
      position = fishState(time - age, i, aspect);
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
