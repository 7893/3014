import { landforms } from "./composition.js";
import { drawLandform } from "./landform.js";

export function drawIslands(ctx, W, H, random) {
  // Jiajing-inspired offshore island, separated from the mainland by open water.
  drawLandform(
    ctx,
    W,
    H,
    random,
    landforms.distant,
    ["#a0b5a2", "#8fa995", "#adbca5"],
    0.4,
  );
  drawLandform(
    ctx,
    W,
    H,
    random,
    landforms.island,
    ["#7a9d88", "#668d76", "#9eae8c"],
    0.55,
  );
  ctx.strokeStyle = "rgba(215,221,192,.65)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(W * 0.593, H * 0.491);
  ctx.quadraticCurveTo(W * 0.675, H * 0.493, W * 0.763, H * 0.491);
  ctx.stroke();
}
