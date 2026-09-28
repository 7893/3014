import { seededRandom, stroke } from "../../drawing/canvas.ts";

export function foliage(c: CanvasRenderingContext2D, W: number, H: number) {
  const random = seededRandom(418);
  c.beginPath(); c.moveTo(-.03 * W, .04 * H);
  c.bezierCurveTo(.02 * W, .17 * H, .16 * W, .22 * H, .3 * W, .22 * H);
  c.bezierCurveTo(.15 * W, .215 * H, .02 * W, .18 * H, -.03 * W, .06 * H);
  c.fillStyle = "#4b584c"; c.fill();
  c.beginPath(); c.moveTo(.055 * W, .15 * H);
  c.bezierCurveTo(.14 * W, .105 * H, .22 * W, .135 * H, .35 * W, .15 * H);
  c.strokeStyle = "#68735d"; c.lineWidth = 2; c.stroke();
  for (let i = 0; i < 37; i++) {
    const x = W * (.025 + random() * .32), y = H * (.13 + random() * .11);
    const length = H * (.065 + random() * .15);
    c.beginPath(); c.moveTo(x, y);
    c.quadraticCurveTo(x + 14, y + length * .55, x + 5, y + length);
    c.strokeStyle = "#7e8e6a88"; c.lineWidth = .9; c.stroke();
    for (let j = 0; j < 12; j++) {
      const yy = y + length * j / 12;
      c.fillStyle = `rgba(83,111,72,${.35 + random() * .35})`;
      c.beginPath(); c.ellipse(x + Math.sin(j / 12 * Math.PI) * 7,
        yy, 1.7, 7, j % 2 ? .55 : -.45, 0, Math.PI * 2); c.fill();
    }
  }
}

export function bank(c: CanvasRenderingContext2D, W: number, H: number) {
  const random = seededRandom(914);
  // Corner banks keep the boat's entire crossing unobstructed.
  for (const [x, y, rx, ry] of [[-.03, .96, .18, .055], [1.05, .99, .21, .045]]) {
    c.fillStyle = "#7a8870";
    c.beginPath(); c.ellipse(x * W, y * H, rx * W, ry * H, -.12, 0, Math.PI * 2); c.fill();
  }
  for (let i = 0; i < 28; i++) {
    const right = i > 14;
    const x = W * (right ? .88 + random() * .16 : random() * .14);
    const y = H * (.91 + random() * .055), radius = 9 + random() * 13;
    c.fillStyle = i % 3 ? "#627e65" : "#8a9b72";
    c.beginPath(); c.ellipse(x, y, radius, radius * .31, -.1, .2, Math.PI * 1.95); c.lineTo(x, y); c.fill();
    stroke(c, [[x - radius * .6, y], [x + radius * .5, y]], "#b4bb8866", .7);
    if (i % 5 === 0) {
      stroke(c, [[x, y], [x + 3, y - 22]], "#6e8264", 1);
      for (let k = -2; k <= 2; k++) {
        c.fillStyle = k % 2 ? "#c79591" : "#e2beb1";
        c.beginPath(); c.ellipse(x + 3 + k * 2, y - 24, 3, 7, k * .28, 0, Math.PI * 2); c.fill();
      }
    }
  }
}
