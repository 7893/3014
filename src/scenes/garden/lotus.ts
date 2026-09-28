import { stroke } from "../../drawing/canvas.ts";

export function lotus(c: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const height = size * 1.9;
  c.save(); c.translate(x, y);
  c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-size * .15, -height * .4, size * .16, -height * .7, 0, -height);
  c.strokeStyle = "#617d59"; c.lineWidth = 2; c.stroke();
  for (let tier = 0; tier < 3; tier++) {
    for (let petal = -3 + tier; petal <= 3 - tier; petal++) {
      c.save(); c.translate(0, -height); c.rotate(petal * .29);
      const length = size * (1.02 - tier * .14), spread = size * (.32 - tier * .055);
      const shade = c.createLinearGradient(0, -length, 0, size * .25);
      shade.addColorStop(0, tier ? "#f0d4c6" : "#c98792");
      shade.addColorStop(.55, "#ead0be"); shade.addColorStop(1, "#b7948e");
      c.beginPath(); c.moveTo(0, size * .18);
      c.bezierCurveTo(-spread, -length * .12, -spread, -length * .68, 0, -length);
      c.bezierCurveTo(spread, -length * .68, spread, -length * .12, 0, size * .18);
      c.fillStyle = shade; c.fill();
      stroke(c, [[0, size * .1], [0, -length * .76]], "#fcdfd055", .6);
      c.restore();
    }
  }
  c.fillStyle = "#ccb77b"; c.beginPath(); c.ellipse(0, -height + size * .06, size * .19, size * .10, 0, 0, Math.PI * 2); c.fill();
  c.restore();
}
