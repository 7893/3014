import { createInk } from "./ink/painting.js";
import { drawStaticInk } from "./ink/static.js";
import { fragment as ink } from "./ink/shaders/main.js";
import { createFishUniforms } from "./ink/uniforms.js";
import { createCity } from "./city/painting.js";
import { drawStaticCity } from "./city/static.js";
import { fragment as city } from "./city/shaders/main.js";
import { createCoast } from "./coast/painting.js";
import { drawStaticCoast } from "./coast/static.js";
import { fragment as coast } from "./coast/shaders/main.js";

/**
 * Scene contract: create(width, height) returns { layers, width, height }.
 * Layer keys match shader sampler names; array ordering is never an API.
 * drawStatic(ctx, painting, boat) supplies the Canvas 2D fallback.
 * Optional uniforms and createUniforms() encapsulate scene-specific motion.
 */
export const definitions = {
  ink: {
    create: createInk,
    drawStatic: drawStaticInk,
    fragment: ink,
    uniforms: ["fish[0]", "fishRipples[0]", "boatOpacity"],
    createUniforms: createFishUniforms,
  },
  city: {
    create: createCity,
    drawStatic: drawStaticCity,
    fragment: city,
    nearest: ["windows"],
  },
  coast: { create: createCoast, drawStatic: drawStaticCoast, fragment: coast },
};
