import { fragment as inkFragment } from "./shaders/scene.js";
import { fragment as cityFragment } from "./shaders/city.js";
import { fragment as coastFragment } from "./shaders/coast.js";
import { fragment as transitionFragment } from "./shaders/transition.js";
export function createPasses(gl, program, names) {
  const passes = {};
  try {
    const shared = [
      "size",
      "time",
      "touch",
      "wind",
      "boatCenter",
      "boat",
      "boatLayer",
      "actorScale",
    ];
    passes.ink = program(inkFragment, [
      ...shared,
      ...names.ink,
      "fish[0]",
      "fishRipples[0]",
      "boatOpacity",
    ]);
    passes.city = program(cityFragment, [...shared, ...names.city]);
    passes.coast = program(coastFragment, [...shared, ...names.coast]);
    passes.final = program(transitionFragment, [
      "size",
      "time",
      "blend",
      "source",
      "destination",
      "sourceInk",
      "destinationInk",
    ]);
    return passes;
  } catch (error) {
    Object.values(passes).forEach((p) => gl.deleteProgram(p.program));
    throw error;
  }
}
