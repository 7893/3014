// A bounded, very slow drift keeps the boat inside the river in both compositions.
export function boatOffset(time) {
  return [Math.sin(time * 0.022) * 0.028, Math.sin(time * 0.68) * 0.00065];
}
