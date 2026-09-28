import { stroke } from "../../drawing/canvas.ts";

function roof(c: CanvasRenderingContext2D, x: number, y: number, w: number) {
  c.fillStyle = "#454c49";
  c.beginPath();
  c.moveTo(x - w * .12, y + 9);
  c.quadraticCurveTo(x + w * .18, y + 10, x + w * .5, y - w * .17);
  c.quadraticCurveTo(x + w * .8, y + 8, x + w * 1.12, y + 9);
  c.quadraticCurveTo(x + w * .9, y + 23, x + w * .5, y + 15);
  c.quadraticCurveTo(x + w * .15, y + 24, x - w * .12, y + 9);
  c.fill();
  c.beginPath(); c.moveTo(x - w * .12, y + 8);
  c.quadraticCurveTo(x + w * .18, y + 9, x + w * .5, y - w * .17);
  c.quadraticCurveTo(x + w * .8, y + 7, x + w * 1.12, y + 8);
  c.strokeStyle = "#a2a596"; c.lineWidth = 1.3; c.stroke();
  for (let i = 1; i < 25; i++) {
    const xx = x + w * i / 25;
    stroke(c, [[xx, y + 13], [xx - (xx - x - w / 2) * .06,
      y - Math.sin(i / 25 * Math.PI) * w * .10]], "#79807855", .8);
  }
}

export function architecture(c: CanvasRenderingContext2D, W: number, H: number) {
  const base = H * .655;
  const wall = c.createLinearGradient(0, H * .42, 0, base);
  wall.addColorStop(0, "#e6e0c8");
  wall.addColorStop(1, "#b6bda4");
  c.fillStyle = wall;
  c.fillRect(0, H * .475, W, H * .18);
  stroke(c, [[0, H * .475], [W, H * .475]], "#707c70", 5);
  stroke(c, [[0, H * .482], [W, H * .482]], "#f1e8ce", 2);
  // A recessed moon gate, with a shaded garden visible through the opening.
  const gx = W * .61, gy = H * .565, r = Math.min(W * .085, H * .086);
  c.fillStyle = "#657868";
  c.beginPath(); c.arc(gx, gy, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#efe8d4"; c.lineWidth = 9; c.stroke();
  c.strokeStyle = "#a5ad99"; c.lineWidth = 1.5; c.stroke();
  c.save(); c.clip();
  c.fillStyle = "#89957a"; c.fillRect(gx - r, gy + r * .25, r * 2, r);
  stroke(c, [[gx - r * .6, gy + r], [gx, gy + r * .3],
    [gx + r * .35, gy + r]], "#c4c3a7", 12);
  for (let i = 0; i < 6; i++) {
    const bx = gx - r * .78 + i * r * .15;
    stroke(c, [[bx, gy + r], [bx + 6, gy - r]], "#3f5948", 1);
    for (let j = 0; j < 5; j++) {
      const by = gy - r * .8 + j * r * .27;
      stroke(c, [[bx, by], [bx - r * .15, by - r * .11]], "#324f4088", 2);
      stroke(c, [[bx, by + 5], [bx + r * .18, by - r * .14]], "#324f4088", 2);
    }
  }
  c.restore();
  // Open waterside pavilion: delicate timber, translucent screens, layered eaves.
  const x = W * .16, w = W * .24, y = base - Math.min(H * .19, W * .23);
  c.fillStyle = "#485c53"; c.fillRect(x, y + 12, w, base - y - 12);
  const light = c.createLinearGradient(x, y, x + w, base);
  light.addColorStop(0, "#b9b194"); light.addColorStop(1, "#746f57");
  c.fillStyle = light; c.fillRect(x + 9, y + 18, w - 18, base - y - 24);
  for (let i = 0; i <= 6; i++) {
    const xx = x + i * w / 6;
    stroke(c, [[xx, y + 14], [xx, base]], "#5b5144", 4);
    for (let j = 0; j < 7 && i < 6; j++)
      stroke(c, [[xx, y + 23 + j * 8], [xx + w / 6, y + 23 + j * 8]], "#4e594955", .8);
  }
  // Recessed open bays between timber frames; upper diamond lattice catches light.
  for (let i = 0; i < 6; i++) {
    const xx = x + i * w / 6, ww = w / 6;
    c.fillStyle = i % 3 === 1 ? "#43574bd9" : "#b5ab8166";
    c.fillRect(xx + 5, y + 58, ww - 10, base - y - 64);
    for (let k = 0; k < 4; k++) {
      const lx = xx + 6 + k * (ww - 12) / 4;
      stroke(c, [[lx, y + 23], [lx + 8, y + 37], [lx, y + 51]], "#d5c8a055", .8);
    }
    stroke(c, [[xx + 4, base - 24], [xx + ww - 4, base - 24]], "#736650", 2);
  }
  roof(c, x - 10, y, w + 20);
  c.fillStyle = "#9ba58e"; c.fillRect(x - 20, base - 8, w + 40, 8);
  stroke(c, [[0, base], [W, base]], "#687c70", 5);
  stroke(c, [[0, base + 3], [W, base + 3]], "#e0d9bc", 2);
  for (let xx = 0; xx < W; xx += 31)
    stroke(c, [[xx, base], [xx + 5, base + 9]], "#788979", .8);
}
