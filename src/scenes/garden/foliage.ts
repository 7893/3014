import { seededRandom } from "../../drawing/canvas.ts";
import { lotus } from "./lotus.ts";

export function foliage(c: CanvasRenderingContext2D, W: number, H: number) {
  const random = seededRandom(1209);
  c.beginPath(); c.moveTo(-20, H * .06);
  c.bezierCurveTo(W * .05, H * .19, W * .15, H * .16, W * .34, H * .19);
  c.strokeStyle = "#4a6252"; c.lineWidth = 7; c.stroke();
  for (let i = 0; i < 48; i++) {
    const x = random() * W * .34, y = H * (.12 + random() * .09);
    const length = H * (.04 + random() * .19);
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 10, y + length * .7, x - 3, y + length);
    c.strokeStyle = "#63805a66"; c.lineWidth = .8; c.stroke();
    for (let j = 0; j < 14; j++) {
      c.fillStyle = `rgba(75,109,68,${.25 + random() * .35})`;
      c.beginPath(); c.ellipse(x + Math.sin(j * .21) * 5, y + length * j / 14,
        2, 6 + random() * 4, j % 2 ? .7 : -.6, 0, Math.PI * 2); c.fill();
    }
  }
}

export function bank(c: CanvasRenderingContext2D, W: number, H: number) {
  const random = seededRandom(402), portrait = W / H < .85;
  // Large near-field pads frame a clear central boating channel.
  for (let i = 0; i < 22; i++) {
    const right = i > 10;
    const x = W * (right ? .83 + random() * .23 : -.05 + random() * .24);
    const y = H * (.94 + random() * .08), r = (portrait ? 43 : 62) * (.6 + random() * .7);
    const shade = c.createLinearGradient(x, y - r, x, y + r);
    shade.addColorStop(0, "#9caf7b"); shade.addColorStop(.5, "#5e845b"); shade.addColorStop(1, "#335f4e");
    c.beginPath(); c.ellipse(x, y, r, r * .37, -.12, .17, Math.PI * 1.94);
    c.lineTo(x, y); c.closePath(); c.fillStyle = shade; c.fill();
    for (let vein = 0; vein < 11; vein++) {
      const a = vein * Math.PI * 2 / 11;
      c.beginPath(); c.moveTo(x, y);
      c.quadraticCurveTo(x + Math.cos(a) * r * .4, y + Math.sin(a) * r * .12,
        x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .33);
      c.strokeStyle = "#c1c89244"; c.lineWidth = .8; c.stroke();
    }
  }
  const size = portrait ? 38 : 48;
  lotus(c, W * .065, H * .97, size);
  lotus(c, W * .19, H * 1.025, size * .67);
  lotus(c, W * .905, H * .985, size * 1.13);
  lotus(c, W * 1.015, H * .945, size * .72);
}
