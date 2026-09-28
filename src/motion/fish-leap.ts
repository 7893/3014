import { fishState } from "./fish.ts";

export const LEAP_DURATION = 0.85;
export function leapingFish(time: number, age: number, aspect: number) {
  const fish = fishState(time, 0, aspect);
  if (age > LEAP_DURATION) return fish;
  const t = age / LEAP_DURATION;
  const next = fishState(time + 0.002, 0, aspect);
  const dx = ((next[0] - fish[0]) * aspect) / 0.002;
  const dy = (next[1] - fish[1]) / 0.002;
  const height = 0.023;
  fish[1] -= 4 * height * t * (1 - t);
  const pitch = Math.atan2(dy - (4 * height * (1 - 2 * t)) / LEAP_DURATION, dx);
  const blend = Math.min(1, t / 0.12, (1 - t) / 0.18);
  const difference = Math.atan2(
    Math.sin(pitch - fish[2]),
    Math.cos(pitch - fish[2]),
  );
  fish[2] += difference * blend;
  fish[3] += Math.sin(Math.PI * t) * 0.25;
  return fish;
}
