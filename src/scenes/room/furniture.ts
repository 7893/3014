import { stroke } from "../../drawing/canvas.ts";
import type { roomLayout } from "./composition.ts";

type Context = CanvasRenderingContext2D;
function oval(c: Context, x: number, y: number, w: number, h: number, color: string) {
  c.fillStyle = color; c.beginPath(); c.ellipse(x, y, w, h, 0, 0, Math.PI * 2); c.fill();
}

function bookcase(c: Context, x: number, y: number, w: number, h: number) {
  c.fillStyle = "#33281f"; c.fillRect(x, y, w, h);
  c.strokeStyle = "#b58a57"; c.lineWidth = 4; c.strokeRect(x, y, w, h);
  for (let row = 0; row < 3; row++) {
    const base = y + h * (row + 1) / 3;
    c.fillStyle = "#826043"; c.fillRect(x, base - 4, w, 5);
    for (let i = 0; i < 7; i++) {
      const bw = w * .075, bh = h * (.13 + .055 * Math.sin(i * 3 + row));
      const bx = x + w * .08 + i * w * .115;
      c.fillStyle = ["#8e7956", "#a38461", "#636958", "#905f49"][(i + row) % 4];
      c.fillRect(bx, base - bh - 5, bw, bh);
      stroke(c, [[bx + 2, base - bh + 2], [bx + bw - 2, base - bh + 2]], "#ddc29870", 1);
    }
  }
}

export function paintFurniture(c: Context, W: number, H: number, layout: ReturnType<typeof roomLayout>) {
  const { floor, candle } = layout, portrait = W / H < .85;
  // Woven rug: a soft foreground plane, with a restrained stitched border.
  c.save(); c.translate(W * .51, H * .91); c.scale(W * .35, H * .085);
  c.fillStyle = "#987558"; c.beginPath(); c.ellipse(0, 0, 1, 1, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#d8b88988"; c.lineWidth = .015;
  for (const r of [.86, .91]) { c.beginPath(); c.ellipse(0, 0, r, r, 0, 0, Math.PI * 2); c.stroke(); }
  c.restore();
  bookcase(c, W * .07, H * (portrait ? .43 : .27), W * .16, H * .30);
  // A low daybed, linen cushions and a draped throw balance the window.
  const bx = W * .66, by = H * .73, bw = W * .28, bh = H * .065;
  c.fillStyle = "#50382b"; c.fillRect(bx, by, bw, bh);
  c.fillRect(bx + bw * .06, by + bh, W * .009, H * .055);
  c.fillRect(bx + bw * .90, by + bh, W * .009, H * .055);
  c.fillStyle = "#b39c76"; c.beginPath(); c.roundRect(bx, by - bh * .55, bw, bh * .68, 9); c.fill();
  for (let i = 0; i < 2; i++) {
    c.save(); c.translate(bx + bw * (.23 + i * .40), by - bh * .65); c.rotate(i ? .13 : -.12);
    c.fillStyle = i ? "#a0795b" : "#787d64";
    c.beginPath(); c.roundRect(-bw * .14, -bh * .62, bw * .28, bh, 8); c.fill(); c.restore();
  }
  c.fillStyle = "#c8b08a"; c.beginPath(); c.moveTo(bx + bw * .60, by - bh * .5);
  c.lineTo(bx + bw * .83, by - bh * .5); c.lineTo(bx + bw * .86, by + bh * 1.7);
  c.quadraticCurveTo(bx + bw * .75, by + bh * 1.9, bx + bw * .63, by + bh * 1.65); c.fill();
  for (let i = 0; i < 6; i++) stroke(c,
    [[bx + bw * (.64 + i * .032), by], [bx + bw * (.65 + i * .032), by + bh * 1.6]], "#745b403b", 1);
  // Rounded tea table, ceramic pot and two cups.
  const tx = W * .60, ty = H * .875, tw = W * .105;
  stroke(c, [[tx - tw * .65, ty], [tx - tw * .7, ty + H * .064]], "#30251f", 7);
  stroke(c, [[tx + tw * .65, ty], [tx + tw * .7, ty + H * .064]], "#30251f", 7);
  oval(c, tx, ty + 5, tw, H * .023, "#39291f");
  oval(c, tx, ty, tw, H * .023, "#96704c");
  oval(c, tx, ty - 5, tw * .66, H * .014, "#5c4935");
  const unit = Math.min(W, H) / 900;
  c.save(); c.translate(tx, ty - 7); c.scale(unit, unit);
  oval(c, 0, -9, 16, 12, "#a29875"); oval(c, 0, -20, 9, 3, "#d0bd93");
  oval(c, 0, -24, 3, 3, "#a29875");
  stroke(c, [[11, -11], [23, -18], [25, -23]], "#a29875", 5);
  c.strokeStyle = "#a29875"; c.lineWidth = 3; c.beginPath(); c.ellipse(-18, -11, 7, 8, 0, 0, Math.PI * 2); c.stroke();
  for (const x of [-36, 35]) { oval(c, x, 3, 12, 4, "#c2ac82"); oval(c, x, -1, 8, 5, "#dfc8a0"); oval(c, x, -3, 6, 2, "#68503a"); }
  c.restore();
  // Candle stand with a paper lamp above; both share the same warm light source.
  const sw = W * .095;
  c.fillStyle = "#4d3527"; c.fillRect(candle.x - sw / 2, candle.y + 16, sw, 8);
  for (const side of [-1, 1]) stroke(c,
    [[candle.x + side * sw * .36, candle.y + 24], [candle.x + side * sw * .4, floor + 15]], "#3e2c23", 6);
  c.fillStyle = "#e6cb94"; c.fillRect(candle.x - 3, candle.y - 14, 6, 29);
  oval(c, candle.x, candle.y + 14, 11, 4, "#c09a59");
  const lx = W * .28, ly = H * .30, lw = W * .042, lh = Math.min(H * .13, W * .16);
  stroke(c, [[lx, H * .11], [lx, ly - lh / 2]], "#453326", 2);
  const glow = c.createRadialGradient(lx, ly, 0, lx, ly, lw * 4);
  glow.addColorStop(0, "#ffc86b65"); glow.addColorStop(1, "transparent");
  c.fillStyle = glow; c.fillRect(lx - lw * 4, ly - lw * 4, lw * 8, lw * 8);
  c.fillStyle = "#e8bd78"; c.beginPath(); c.roundRect(lx - lw / 2, ly - lh / 2, lw, lh, lw * .22); c.fill();
  for (let i = 1; i < 8; i++) stroke(c, [[lx - lw / 2, ly - lh / 2 + lh * i / 8],
    [lx + lw / 2, ly - lh / 2 + lh * i / 8]], "#8d623934", 1);
  // A leafy ceramic planter softens the far corner.
  const px = W * .92, py = H * .85;
  c.fillStyle = "#79785a"; c.beginPath(); c.moveTo(px - W * .026, py);
  c.lineTo(px + W * .026, py); c.lineTo(px + W * .018, py + H * .055);
  c.lineTo(px - W * .018, py + H * .055); c.fill();
  for (let i = 0; i < 7; i++) {
    const ex = px + Math.sin(i * 2.3) * W * .036, ey = py - H * (.045 + i * .013);
    stroke(c, [[px, py], [ex, ey]], "#687055", 2);
    c.save(); c.translate(ex, ey); c.rotate(Math.sin(i * 2.3) * .8);
    oval(c, 0, 0, W * .009, H * .025, i % 2 ? "#8c956d" : "#637253"); c.restore();
  }
}
