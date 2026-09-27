import { FISH_COUNT } from "../../motion/fish.js";
import { updateFish } from "./fish-data.js";

export function createFishUniforms() {
  const fish = new Float32Array(FISH_COUNT * 4);
  const ripples = new Float32Array(FISH_COUNT * 4);
  return (gl, u, canvas, time) => {
    updateFish(canvas, time, fish, ripples);
    gl.uniform4fv(u["fish[0]"], fish);
    gl.uniform4fv(u["fishRipples[0]"], ripples);
    gl.uniform1f(u.boatOpacity, 1);
  };
}
