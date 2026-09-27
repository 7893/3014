import { createCoast } from "./coast/painting.js";
import { createCity } from "./city/painting.js";
import { createBrush } from "./painting/brush.js";
import { createMountains } from "./painting/mountains.js";
import { createPines } from "./painting/pines.js";
import { paintBoat } from "./painting/boat.js";
import { fishState, FISH_COUNT } from "./motion/fish.js";

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
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.scale(width / W, height / H);
    const tools = createBrush(ctx, seed),
      mountains = createMountains(tools),
      pine = createPines(tools);
    draw({ ...tools, ...mountains, pine });
    layers[name] = canvas;
  }
  layer(
    "paper",
    ({ ctx, random, between, line, ink }) => {
      const wash = ctx.createRadialGradient(
        W * 0.47,
        H * 0.38,
        0,
        W * 0.5,
        H * 0.5,
        Math.max(W, H) * 0.75,
      );
      wash.addColorStop(0, "#f4f0e4");
      wash.addColorStop(1, "#e4decd");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 14000; i++) {
        const x = random() * W,
          y = random() * H;
        line(
          [
            [x, y],
            [x + between(0.4, 2.2), y + between(-0.7, 0.7)],
          ],
          `rgba(102,91,65,${between(0.015, 0.055)})`,
          between(0.3, 0.7),
        );
      }
      for (let i = 0; i < 90; i++) {
        const x = W * between(0.15, 0.96),
          y = H * between(0.73, 0.96),
          length = between(5, 48);
        line(
          [
            [x, y],
            [x + length * 0.4, y - 0.5],
            [x + length, y],
          ],
          ink(between(0.018, 0.06)),
          0.6,
        );
      }
    },
    101,
  );
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
  layer(
    "near",
    ({ mountain, pine, brush, line, ink, between }) => {
      if (portrait) {
        mountain(W * 0.14, H * 0.68, W * 0.98, H * 0.52, 0.86, 2.7);
        mountain(W * 0.42, H * 0.72, W * 0.61, H * 0.24, 0.63, 4.2);
      } else {
        mountain(W * 0.23, H * 0.7, W * 0.64, H * 0.76, 0.86, 2.3);
        mountain(W * 0.48, H * 0.71, W * 0.38, H * 0.43, 0.56, 3.8);
      }
      for (let i = 0; i < 27; i++) {
        const t = between(0, 1),
          x = W * ((portrait ? 0.02 : 0.12) + t * (portrait ? 0.46 : 0.4));
        pine(
          x,
          H * (0.69 + Math.sin(i * 1.3) * 0.016),
          between(7, 15),
          -0.1,
          0.19,
        );
      }
      const x = W * (portrait ? 0.35 : 0.39),
        y = H * 0.71,
        s = portrait ? 13 : 16;
      brush(
        [
          [x - s, y],
          [x - s * 0.8, y - s * 0.12],
          [x, y - s * 0.62],
          [x + s * 0.8, y - s * 0.12],
          [x + s, y],
        ],
        0.5,
        0.9,
      );
      line(
        [
          [x - s * 0.68, y],
          [x - s * 0.68, y + s * 0.6],
          [x + s * 0.65, y + s * 0.6],
          [x + s * 0.65, y],
        ],
        ink(0.36),
        0.7,
      );
      line(
        [
          [x, y],
          [x, y + s * 0.6],
        ],
        ink(0.3),
        0.5,
      );
      for (let i = 0; i < 2; i++) {
        const bx = W * (0.62 + i * 0.025),
          by = H * (0.49 - i * 0.012),
          r = portrait ? 2.5 : 3;
        brush(
          [
            [bx - r, by - 1],
            [bx, by],
            [bx + r, by - 1.5],
          ],
          0.35,
          0.65,
        );
      }
    },
    404,
  );
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

export function drawStaticScene(ctx, scene) {
  const { layers, width, height } = scene;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(layers.paper, 0, 0);
  ctx.save();
  ctx.fillStyle = "rgba(163,92,59,.19)";
  ctx.beginPath();
  ctx.arc(
    width * (scene.portrait ? 0.32 : 0.72),
    height * (scene.portrait ? 0.12 : 0.205),
    Math.min(width, height) * 0.039,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
  // The same ink layers yield a complete still painting without WebGL.
  for (const name of ["far", "middle", "near"])
    ctx.drawImage(layers[name], 0, 0);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, height * 0.735, width, height * 0.215);
  ctx.clip();
  ctx.translate(0, height * 0.73);
  ctx.scale(1, -0.5);
  ctx.translate(0, -height * 0.73);
  ctx.globalAlpha = 0.18;
  for (const name of ["far", "middle", "near"])
    ctx.drawImage(layers[name], 0, 0);
  ctx.restore();
  for (let i = 0; i < FISH_COUNT; i++) {
    const fish = fishState(0, i, width / height),
      size = Math.min(width, height) * 0.027;
    ctx.save();
    ctx.translate(fish[0] * width, fish[1] * height);
    ctx.rotate(fish[2]);
    ctx.scale(size, size);
    ctx.fillStyle = `rgba(79,94,77,${fish[3]})`;
    ctx.beginPath();
    ctx.ellipse(0.08, 0, 0.58, 0.19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-0.4, 0);
    ctx.lineTo(-0.93, -0.27);
    ctx.lineTo(-0.88, 0.27);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  for (const name of ["shore", "pines", "boat"])
    ctx.drawImage(layers[name], 0, 0);
}
