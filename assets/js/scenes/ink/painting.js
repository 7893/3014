import { canvasLayer } from "../../drawing/canvas.js";
import { createBrush } from "../../drawing/brush.js";
import { paintPaper } from "./paper.js";
import { compositions } from "./composition.js";
import { paintKarst } from "./karst.js";
import { paintBamboo, paintBroadleaf } from "./vegetation.js";
import { paintRiverbank, paintSettlement } from "./riverbank.js";

export function createInk(width, height) {
  const portrait = width / height < 0.85,
    W = portrait ? 760 : 1600;
  const H = (W * height) / width,
    layers = {};
  const composition = compositions[portrait ? "portrait" : "landscape"];
  function layer(name, seed, paint) {
    const { canvas, ctx } = canvasLayer(width, height, W);
    paint(createBrush(ctx, seed));
    layers[name] = canvas;
  }
  layer("paper", 101, (tools) => paintPaper(tools, W, H, portrait));
  for (const [index, name] of ["far", "middle", "near"].entries())
    layer(name, 202 + index * 101, (tools) => {
      for (const peak of composition[name]) paintKarst(tools, W, H, peak);
      if (name === "near") paintSettlement(tools, W, H);
    });
  layer("shore", 505, (tools) => paintRiverbank(tools, W, H, portrait));
  layer("foliage", 606, (tools) => {
    const height = Math.min(H * 0.23, W * 0.38);
    paintBroadleaf(tools, W * 0.022, H * 0.894, height * 0.53, 0.65);
    paintBamboo(tools, W * 0.075, H * 0.895, height);
    paintBamboo(tools, W * 0.15, H * 0.905, height * 0.64);
  });
  return { layers, width, height, portrait };
}
