import { hall, roof, rock } from "./structures.ts";
import { stroke, seededRandom } from "../../drawing/canvas.ts";
import { courtyardWall, corridor, stoneBridge } from "./courtyard.ts";

export function architecture(c: CanvasRenderingContext2D, W: number, H: number) {
  const base = H * .655, unit = Math.min(W, H), random = seededRandom(733);
  // Receding white residences, linked by a dark-tiled waterside gallery.
  c.save(); c.globalAlpha = .54;
  hall(c, W * .29, base - H * .055, W * .29, unit * .14);
  c.restore();
  courtyardWall(c, W, H);
  corridor(c, W * .35, base - H * .018, W * .34, unit * .10);
  // Main study: a low domestic hall rather than a symmetrical palace facade.
  hall(c, W * .025, base, W * .30, unit * .20);
  const gx = W * .012, gy = base - unit * .19, gw = W * .055;
  c.fillStyle = "#edece0"; c.beginPath(); c.moveTo(gx, base);
  c.lineTo(gx, gy); c.lineTo(gx + gw * .25, gy - unit * .075);
  c.lineTo(gx + gw * .78, gy - unit * .075); c.lineTo(gx + gw, gy);
  c.lineTo(gx + gw, base); c.closePath(); c.fill();
  stroke(c, [[gx, gy], [gx + gw * .25, gy - unit * .075],
    [gx + gw * .78, gy - unit * .075], [gx + gw, gy]], "#586762", 4);
  // A small pavilion at the turn of the gallery, open to the lotus pond.
  const px = W * .89, py = base - H * .008, pw = W * .14, ph = unit * .14;
  for (const side of [-.36, .36])
    stroke(c, [[px + pw * side, py], [px + pw * side, py - ph]], "#615d49", 4);
  stroke(c, [[px - pw * .5, py], [px + pw * .5, py]], "#a5b09b", 6);
  roof(c, px - pw / 2, py - ph, pw, pw * .23);
  // Low mossy retaining wall and irregular stone joints establish the waterline.
  c.fillStyle = "#829688"; c.fillRect(0, base, W, H * .011);
  stroke(c, [[0, base], [W, base]], "#dddcca", 2);
  for (let i = 0; i < 38; i++) {
    const x = W * i / 37;
    stroke(c, [[x, base + 1], [x + 2, base + H * .009]], "#526e6355", 1);
  }
  stoneBridge(c, W * .54, H * .68, W * .23, unit * .045);
  rock(c, W * .77, base + H * .012, unit * .072);
  rock(c, W * .82, base + H * .014, unit * .039);
  for (let i = 0; i < 500; i++) {
    c.fillStyle = "#708c631c";
    c.fillRect(random() * W, base - random() * unit * .015, 1 + random() * 5, 1);
  }
}
