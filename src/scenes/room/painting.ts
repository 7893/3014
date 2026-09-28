import { canvasLayer, stroke } from "../../drawing/canvas.ts";
import { roomLayout } from "./composition.ts";
import { paintCouple } from "./figures.ts";

export function createRoom(width: number, height: number) {
  const W = width / height < .85 ? 760 : 1600, H = W * height / width;
  const { window: win, couple, candle, floor } = roomLayout(W, H);
  const layers: Record<string, HTMLCanvasElement> = {};
  const contexts: Record<string, CanvasRenderingContext2D> = {};
  for (const name of ["interior", "curtain", "figures"]) {
    const layer = canvasLayer(width, height, W);
    layers[name] = layer.canvas; contexts[name] = layer.ctx;
  }
  const c = contexts.interior;
  const wall = c.createLinearGradient(0, 0, W, H);
  wall.addColorStop(0, "#302b2b"); wall.addColorStop(.55, "#3b3836"); wall.addColorStop(1, "#18252c");
  c.fillStyle = wall; c.fillRect(0, 0, W, H);
  const pool = c.createRadialGradient(candle.x, candle.y - 20, 0, candle.x, candle.y - 20, W * .49);
  pool.addColorStop(0, "#ac744650"); pool.addColorStop(1, "transparent");
  c.fillStyle = pool; c.fillRect(0, 0, W, H);
  c.fillStyle = "#222426"; c.fillRect(0, floor, W, H - floor);
  for (let i = 0; i < 9; i++) {
    stroke(c, [[W * .65, floor], [W * (i / 7 - .1), H]], "#b9956222", 1);
    const y = floor + (H - floor) * (i / 8) ** 1.8;
    stroke(c, [[0, y], [W, y]], "#b9956215", 1);
  }
  const sky = c.createLinearGradient(0, win.y, 0, win.y + win.height);
  sky.addColorStop(0, "#172c43"); sky.addColorStop(1, "#638085");
  c.fillStyle = sky; c.fillRect(win.x, win.y, win.width, win.height);
  c.save(); c.beginPath(); c.rect(win.x, win.y, win.width, win.height); c.clip();
  const mx = win.x + win.width * .69, my = win.y + win.height * .27, moon = win.width * .053;
  const halo = c.createRadialGradient(mx, my, moon, mx, my, moon * 5);
  halo.addColorStop(0, "#d7e5d23b"); halo.addColorStop(1, "transparent");
  c.fillStyle = halo; c.fillRect(win.x, win.y, win.width, win.height);
  c.fillStyle = "#e2e4ce"; c.beginPath(); c.arc(mx, my, moon, 0, Math.PI * 2); c.fill();
  for (let row = 0; row < 3; row++) {
    c.beginPath(); c.moveTo(win.x, win.y + win.height);
    for (let i = 0; i <= 30; i++) {
      const xx = win.x + win.width * i / 30;
      const yy = win.y + win.height * (.78 + row * .07 - Math.sin(i * .34 + row) * .06);
      c.lineTo(xx, yy);
    }
    c.lineTo(win.x + win.width, win.y + win.height); c.closePath();
    c.fillStyle = ["#4d6d72", "#3f5d64", "#2c474f"][row]; c.fill();
  }
  c.restore();
  c.strokeStyle = "#736656"; c.lineWidth = 8; c.strokeRect(win.x, win.y, win.width, win.height);
  c.strokeStyle = "#af9c7355"; c.lineWidth = 1.5; c.strokeRect(win.x - 7, win.y - 7, win.width + 14, win.height + 14);
  for (let i = 1; i < 4; i++)
    stroke(c, [[win.x + win.width * i / 4, win.y], [win.x + win.width * i / 4, win.y + win.height]], "#625d50", 3);
  stroke(c, [[win.x, win.y + win.height * .73], [win.x + win.width, win.y + win.height * .73]], "#625d50", 3);
  const tableWidth = W * .13;
  c.fillStyle = "#312923"; c.fillRect(candle.x - tableWidth / 2, candle.y + 16, tableWidth, 7);
  stroke(c, [[candle.x - tableWidth * .35, candle.y + 21], [candle.x - tableWidth * .33, floor + 13]], "#2a2523", 5);
  stroke(c, [[candle.x + tableWidth * .35, candle.y + 21], [candle.x + tableWidth * .33, floor + 13]], "#2a2523", 5);
  c.fillStyle = "#c7b288"; c.fillRect(candle.x - 3, candle.y - 14, 6, 29);
  c.fillStyle = "#86704a"; c.beginPath(); c.ellipse(candle.x, candle.y + 14, 10, 3, 0, 0, Math.PI * 2); c.fill();
  const veil = contexts.curtain;
  for (const side of [0, 1]) {
    const x = win.x + win.width * side;
    const span = win.width * .16;
    veil.beginPath(); veil.moveTo(x - span * .3, win.y - 14);
    veil.lineTo(x + span * .6, win.y - 14);
    veil.bezierCurveTo(x + span, win.y + win.height * .4, x + span * .3, floor - 30, x + span * .8, floor + 7);
    veil.quadraticCurveTo(x, floor + 20, x - span * .3, floor + 5); veil.closePath();
    veil.fillStyle = "#ded3b943"; veil.fill();
    for (let i = 0; i < 8; i++) {
      const xx = x + span * (i / 10 - .2);
      veil.beginPath(); veil.moveTo(xx, win.y - 14);
      veil.bezierCurveTo(xx + span * .4, win.y + win.height * .4, xx - span * .2, floor - 50, xx + span * .3, floor + 7);
      veil.strokeStyle = "#e3d9bf17"; veil.lineWidth = 2; veil.stroke();
    }
  }
  paintCouple(contexts.figures, couple.x, couple.y, couple.size);
  return { layers, width, height };
}
