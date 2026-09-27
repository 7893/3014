import { canvasLayer } from "./painting/canvas.js";
import { paintPaper, paintNear } from "./painting/ink-details.js";
import { createCoast } from "./coast/painting.js";
import { createCity } from "./city/painting.js";
import { createBrush } from "./painting/brush.js";
import { createMountains } from "./painting/mountains.js";
import { createPines } from "./painting/pines.js";
import { paintBoat } from "./painting/boat.js";
export { drawStaticScene } from "./painting/static.js";

export const layerNames = [
  "paper",
  "far",
  "middle",
  "near",
  "shore",
  "pines",
  "boat",
];
export function createScene(width, height) {
  const portrait = width / height < 0.85,
    W = portrait ? 760 : 1600,
    H = (W * height) / width;
  const layers = {};
  function layer(name, draw, seed) {
    const { canvas, ctx } = canvasLayer(width, height, W);
    const tools = createBrush(ctx, seed),
      mountains = createMountains(tools),
      pine = createPines(tools);
    draw({ ...tools, ...mountains, pine });
    layers[name] = canvas;
  }
  layer("paper", (tools) => paintPaper(tools, W, H, portrait), 101);
  layer(
    "far",
    ({ mountain }) => {
      if (portrait) {
        mountain(W * 0.2, H * 0.5, W * 1.1, H * 0.33, 0.18, 2, false);
        mountain(W * 0.84, H * 0.6, W * 0.95, H * 0.21, 0.16, 4, false);
      } else {
        mountain(W * 0.43, H * 0.57, W * 0.88, H * 0.45, 0.16, 3, false);
        mountain(W * 0.88, H * 0.65, W * 0.58, H * 0.25, 0.18, 2, false);
      }
    },
    202,
  );
  layer(
    "middle",
    ({ mountain }) => {
      if (portrait)
        mountain(W * 0.44, H * 0.63, W * 0.95, H * 0.42, 0.35, 1, false);
      else mountain(W * 0.35, H * 0.62, W * 0.72, H * 0.6, 0.33, 1.8, false);
    },
    303,
  );
  layer("near", (tools) => paintNear(tools, W, H, portrait), 404);
  layer(
    "shore",
    ({ mountain, rock, pine, between }) => {
      const y = H * (portrait ? 0.9 : 0.91);
      mountain(W * 0.04, y, W * (portrait ? 0.83 : 0.63), H * 0.12, 0.78, 2.5);
      for (let i = 0; i < 13; i++)
        rock(
          W * between(-0.02, portrait ? 0.31 : 0.26),
          y + between(-12, 12),
          between(30, 95),
          between(16, 37),
          0.6,
        );
      mountain(W * 1.03, H * 0.785, W * 0.37, H * 0.05, 0.23, 4, false);
      for (let i = 0; i < 9; i++)
        pine(W * between(0.91, 1.06), H * 0.78, between(8, 19), -0.15, 0.2);
    },
    505,
  );
  layer(
    "pines",
    ({ pine }) => {
      const y = H * (portrait ? 0.9 : 0.91);
      pine(W * 0.09, y - 20, H * (portrait ? 0.145 : 0.27), 0.24, 0.85);
      pine(W * 0.18, y - 10, H * (portrait ? 0.11 : 0.19), -0.28, 0.78);
      pine(W * 0.045, y - 25, H * (portrait ? 0.09 : 0.16), -0.35, 0.66);
    },
    606,
  );
  const boatCenter = [portrait ? 0.64 : 0.69, portrait ? 0.815 : 0.805];
  layer(
    "boat",
    (tools) =>
      paintBoat(
        tools,
        W * boatCenter[0],
        H * boatCenter[1],
        portrait ? 1.35 : 1.6,
      ),
    707,
  );
  return {
    layers,
    width,
    height,
    boatCenter,
    portrait,
    city: createCity(width, height),
    coast: createCoast(width, height),
  };
}
