// Built separately for local regression tests; never included in dist/.
export { createScene } from "../../src/scenes/index.ts";
export { createRenderer } from "../../src/rendering/renderer.ts";
export { hitWater } from "../../src/scenes/water-hit.ts";
export { createJourney } from "../../src/motion/journey.ts";
export { createBoat } from "../../src/actors/boat.ts";
export { boat } from "../../src/rendering/shaders/boat.ts";
export { createGeometry, createPass } from "../../src/rendering/pass.ts";
export { WebGLRenderer, Ticker } from "pixi.js";
export { createRunningChild } from "../../src/actors/child.ts";
export { BEACH_RUN } from "../../src/config/actors.ts";
export { roomLayout } from "../../src/scenes/room/composition.ts";
export { createPierGeometry } from "../../src/scenes/coast/pier.ts";
