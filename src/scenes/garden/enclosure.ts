import { stroke, seededRandom } from "../../drawing/canvas.ts";

export function enclosure(c: CanvasRenderingContext2D, W: number, H: number) {
  const random = seededRandom(639), base = H * .655;
  // Successive, receding white walls rather than a single flat enclosure.
  for (const [x, y, w, color] of [[.34, .425, .39, "#c4ccba"], [.43, .452, .35, "#d7d9c5"]] as const) {
    c.fillStyle = color; c.fillRect(W * x, H * y, W * w, base - H * y);
    stroke(c, [[W * x, H * y], [W * (x + w), H * y]], "#859080", 3);
  }
  const wall = c.createLinearGradient(0, H * .48, 0, base);
  wall.addColorStop(0, "#e7e1cd"); wall.addColorStop(1, "#b9c2ad");
  c.beginPath(); c.moveTo(0, H * .48);
  c.bezierCurveTo(W * .24, H * .48, W * .37, H * .52, W * .47, H * .495);
  c.bezierCurveTo(W * .62, H * .45, W * .78, H * .455, W, H * .49);
  c.lineTo(W, base); c.lineTo(0, base); c.closePath(); c.fillStyle = wall; c.fill();
  c.beginPath(); c.moveTo(0, H * .48);
  c.bezierCurveTo(W * .24, H * .48, W * .37, H * .52, W * .47, H * .495);
  c.bezierCurveTo(W * .62, H * .45, W * .78, H * .455, W, H * .49);
  c.strokeStyle = "#788579"; c.lineWidth = 5; c.stroke();
  // Fine plaster grain and damp stonework at the waterline.
  for (let i = 0; i < 1000; i++) {
    c.fillStyle = i % 2 ? "#eef0d514" : "#677c6810";
    c.fillRect(random() * W, H * (.53 + random() * .12), 1 + random() * 4, .7);
  }
  for (let row = 0; row < 3; row++) {
    const y = base - 5 - row * 5;
    stroke(c, [[0, y], [W, y]], "#677c6822", .8);
    for (let x = row % 2 * 17; x < W; x += 34)
      stroke(c, [[x, y], [x, y - 5]], "#677c6822", .7);
  }
  // A covered gallery bends away toward the rear garden.
  const x0 = W * .77, x1 = W * 1.03, y0 = H * .635, y1 = H * .57;
  const roofHeight = Math.min(H * .12, W * .13);
  c.beginPath(); c.moveTo(x0 - 8, y0 - roofHeight);
  c.lineTo(x1, y1 - roofHeight * .75);
  c.lineTo(x1, y1 - roofHeight * .75 + 9); c.lineTo(x0 - 9, y0 - roofHeight + 12);
  c.closePath(); c.fillStyle = "#59675d"; c.fill();
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    const height = roofHeight * (1 - t * .25);
    stroke(c, [[x, y - height + 10], [x, y]], "#716d56", 2.5);
    if (i < 8) {
      const nx = x0 + (x1 - x0) * (t + .125), ny = y0 + (y1 - y0) * (t + .125);
      stroke(c, [[x, y - 11], [nx, ny - 11]], "#8b8870", 1.5);
      stroke(c, [[x, y], [nx, ny]], "#9da28b", 3);
    }
  }
  // Lattice opening offers a second framed glimpse into the garden.
  const wx = W * .065, wy = base - Math.min(H * .10, W * .09), size = W * .047;
  c.fillStyle = "#6f8270"; c.fillRect(wx - size, wy - size * .65, size * 2, size * 1.3);
  c.strokeStyle = "#dddcc4"; c.lineWidth = 5; c.strokeRect(wx - size, wy - size * .65, size * 2, size * 1.3);
  for (let i = -3; i <= 3; i++) {
    const x = wx + i * size / 4;
    stroke(c, [[x, wy - size * .6], [x, wy + size * .6]], "#a6b199", 1);
    stroke(c, [[wx - size, wy + i * size * .17], [wx + size, wy + i * size * .17]], "#a6b199", 1);
  }
}
