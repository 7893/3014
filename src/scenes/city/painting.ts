import { skyline } from "./composition.ts";
import { createGlow } from "../../drawing/glow.ts";
import { roomMarker } from "./windows.ts";
import { seededRandom, canvasLayer } from "../../drawing/canvas.ts";
import { stroke } from "../../drawing/canvas.ts";
import { createTrees } from "./trees.ts";
import { drawRiver } from "./river.ts";
import { drawBeijingSkyline } from "./details.ts";
// An imagined Liangma River evening, drawn entirely from geometry and light.
export function createCity(width: number, height: number) {
  const portrait = width / height < 0.85,
    W = portrait ? 760 : 1600,
    H = (W * height) / width;
  const layers: Record<string, HTMLCanvasElement> = {},
    contexts: Record<string, CanvasRenderingContext2D> = {};
  for (const name of ["buildings", "lights", "bank", "windows"]) {
    const { canvas, ctx } = canvasLayer(width, height, W);
    layers[name] = canvas;
    contexts[name] = ctx;
  }
  const { buildings: b, lights: l, bank: k } = contexts;
  const markRoom = roomMarker(contexts.windows);
  const random = seededRandom(2873);
  const landmark = skyline[portrait ? "portrait" : "landscape"].angled;
  b.save();
  l.save();
  b.globalAlpha = 0.78;
  l.globalAlpha = 0.62;
  drawBeijingSkyline(b, l, W, H);
  b.restore();
  l.restore();
  // Low, recessed buildings: irregular occupied rooms, no outlined landmark icons.
  for (let i = 0; i < 25; i++) {
    const x = (i * W) / 24 - 30,
      w = 24 + random() * 65,
      candidate = H * (0.035 + random() * 0.14),
      nearLandmark = x + w > W * (landmark.x - landmark.width * .7) &&
        x < W * (landmark.x + landmark.width * .7),
      h = nearLandmark ? Math.min(candidate, H * (.59 - landmark.top - landmark.height * .8)) : candidate,
      y = H * 0.59 - h;
    const shade = b.createLinearGradient(x, y, x + w, H * 0.59);
    shade.addColorStop(0, "#26343c");
    shade.addColorStop(1, "#15292e");
    b.fillStyle = shade;
    b.fillRect(x, y, w, h);
    b.fillStyle = "rgba(137,157,158,.05)";
    b.fillRect(x, y, w, 2);
    let floor = i * 19;
    for (let yy = y + 8; yy < H * 0.585; yy += 7 + random() * 3) {
      floor++;
      const occupied = random();
      for (let xx = x + 4; xx < x + w - 4; xx += 5) {
        if (random() > occupied * 0.8 + 0.26) {
          l.fillStyle = `rgba(226,${164 + Math.floor(random() * 42)},115,${0.07 + random() * 0.32})`;
          const width = 1.5 + random() * 2;
          l.fillRect(xx, yy, width, 2.4);
          markRoom(xx, yy, width, 2.4, floor);
        }
      }
    }
  }
  // A quiet hotel frontage glimpsed through the trees, set back from the river.
  const hx = W * 0.18,
    hy = H * 0.425,
    hw = W * 0.2,
    hh = H * 0.16;
  b.fillStyle = "#1c3037";
  b.fillRect(hx, hy, hw, hh);
  for (let floor = 0; floor < 12; floor++) {
    const y = hy + 8 + (floor * hh) / 13;
    stroke(
      b,
      [
        [hx, y],
        [hx + hw, y],
      ],
      "rgba(114,133,136,.11)",
      1,
    );
    for (let x = hx + 5; x < hx + hw - 5; x += 6)
      if (random() > 0.47) {
        l.fillStyle = `rgba(236,190,130,${0.13 + random() * 0.3})`;
        const width = 2 + random() * 2;
        l.fillRect(x, y - 3, width, 2);
        markRoom(x, y - 3, width, 2, 500 + floor);
      }
  }
  const tree = createTrees(random, l);
  drawRiver({ b, l, k, W, H, random, tree });
  layers.glow = createGlow(layers.lights);
  return { layers, width, height, portrait };
}
