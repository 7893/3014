import { hall, roof, rock } from "./structures.ts";
import { stroke, seededRandom } from "../../drawing/canvas.ts";

export function architecture(c: CanvasRenderingContext2D, W: number, H: number) {
  const base = H * .655, portrait = W / H < .85;
  // A deep private estate: rear hall, side courtyard, then the waterside residence.
  c.save(); c.globalAlpha = .64;
  hall(c, W * .37, base - H * .05, W * .29, Math.min(H * .17, W * .25));
  c.restore();
  const plaster = c.createLinearGradient(0, H * .44, 0, base);
  plaster.addColorStop(0, "#ede6d1"); plaster.addColorStop(1, "#adbaa3");
  c.fillStyle = plaster;
  c.beginPath(); c.moveTo(W * .41, base); c.lineTo(W * .41, base - H * .13);
  c.lineTo(W * .60, base - H * .11); c.lineTo(W * .73, base - H * .20);
  c.lineTo(W, base - H * .15); c.lineTo(W, base); c.closePath(); c.fill();
  stroke(c, [[W * .41, base - H * .13], [W * .60, base - H * .11],
    [W * .73, base - H * .20], [W, base - H * .15]], "#718577", 5);
  // A round doorway frames a second courtyard and a path disappearing behind bamboo.
  const r = Math.min(W * .062, H * .075), gx = W * .765, gy = base - r - 4;
  c.fillStyle = "#567366"; c.beginPath(); c.arc(gx, gy, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#eee4cc"; c.lineWidth = 7; c.stroke();
  c.save(); c.clip();
  c.fillStyle = "#b6c2a7"; c.fillRect(gx - r, gy - r * .7, r * 2, r * .45);
  stroke(c, [[gx - r, gy - r * .72], [gx + r, gy - r * .72]], "#6f8772", 3);
  c.beginPath(); c.moveTo(gx + r * .25, gy + r);
  c.bezierCurveTo(gx - r * .7, gy + r * .2, gx + r * .8, gy + r * .25, gx + r * .1, gy - r * .25);
  c.strokeStyle = "#c8c9ab"; c.lineWidth = r * .15; c.stroke();
  for (let i = 0; i < 7; i++) {
    const x = gx - r + i * r * .13;
    stroke(c, [[x, gy + r], [x + 4, gy - r]], "#315344", 1.2);
    for (let j = 0; j < 7; j++)
      stroke(c, [[x, gy - r + j * r * .24], [x + r * .18, gy - r + j * r * .24 - 5]], "#46684c", 1.7);
  }
  c.restore();
  // Main two-storey hall and an open waterside veranda.
  const height = Math.min(H * .23, W * .37);
  hall(c, W * .045, base, W * .36, height, 2);
  const vx = W * .415, vw = W * .22, vh = height * .40;
  const shade = c.createLinearGradient(0, base - vh, 0, base);
  shade.addColorStop(0, "#516b5f"); shade.addColorStop(1, "#99aa8e");
  c.fillStyle = shade; c.fillRect(vx, base - vh, vw, vh);
  for (let i = 0; i <= 5; i++) {
    const x = vx + vw * i / 5;
    stroke(c, [[x, base - vh], [x, base]], "#5a6150", 3);
    if (i < 5) {
      stroke(c, [[x, base - 12], [x + vw / 5, base - 12]], "#b9b99a", 2);
      for (let k = 1; k < 4; k++)
        stroke(c, [[x + vw * k / 20, base - 12], [x + vw * k / 20, base - 3]], "#6b765e", 1);
    }
  }
  roof(c, vx, base - vh, vw, vw * .08);
  // Broad stone terrace and shallow steps at the pond's edge.
  for (let i = 0; i < 3; i++) {
    c.fillStyle = ["#adbaa2", "#8da28e", "#718c7b"][i];
    c.fillRect(0, base - 3 + i * 3, W, 3);
  }
  const random = seededRandom(733);
  for (let i = 0; i < 750; i++) {
    c.fillStyle = i % 2 ? "#edf0d710" : "#506d5610";
    c.fillRect(random() * W, base - random() * height, 1 + random() * 3, .8);
  }
  rock(c, W * .88, base, W * (portrait ? .09 : .055));
  rock(c, W * .95, base + 1, W * .035);
}
