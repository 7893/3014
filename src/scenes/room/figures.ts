import { stroke } from "../../drawing/canvas.ts";

// Two fully clothed adults sharing a quiet embrace, expressed as soft silhouettes.
export function paintCouple(c: CanvasRenderingContext2D, x: number, y: number, size: number) {
  c.save(); c.translate(x, y); c.scale(size / 100, size / 100);
  c.fillStyle = "#131f26";
  c.beginPath(); c.moveTo(-17, -74);
  c.bezierCurveTo(-28, -67, -25, -40, -21, -19);
  c.lineTo(-22, 0); c.lineTo(-5, 0); c.lineTo(-2, -30);
  c.lineTo(7, -3); c.lineTo(16, -3); c.lineTo(7, -48);
  c.bezierCurveTo(8, -66, 0, -73, -5, -75); c.fill();
  c.beginPath(); c.ellipse(-10, -84, 8, 10, -.22, 0, Math.PI * 2); c.fill();
  // A long, softly draped dress, shoulders and hair bun identify the second figure.
  const dress = c.createLinearGradient(-5, -60, 29, 0);
  dress.addColorStop(0, "#64524b"); dress.addColorStop(1, "#263038");
  c.fillStyle = dress;
  c.beginPath(); c.moveTo(4, -67);
  c.bezierCurveTo(-3, -56, 1, -39, 2, -33);
  c.bezierCurveTo(2, -20, -6, -4, -6, -1);
  c.quadraticCurveTo(15, 5, 30, -2);
  c.bezierCurveTo(25, -18, 22, -34, 18, -43);
  c.quadraticCurveTo(25, -64, 11, -68); c.fill();
  c.fillStyle = "#242c30";
  c.beginPath(); c.ellipse(5, -75, 7, 9, -.38, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(11, -82, 4, 0, Math.PI * 2); c.fill();
  // Sleeved arms rest around each other's shoulders and back.
  c.beginPath(); c.moveTo(16, -60); c.quadraticCurveTo(4, -68, -16, -65);
  c.strokeStyle = "#67544b"; c.lineWidth = 5; c.lineCap = "round"; c.stroke();
  c.beginPath(); c.moveTo(-20, -64); c.quadraticCurveTo(-15, -42, 16, -43);
  c.strokeStyle = "#243038"; c.lineWidth = 7; c.stroke();
  stroke(c, [[-19, -75], [-23, -62], [-22, -49]], "#b88e6355", .7);
  stroke(c, [[6, -65], [3, -54]], "#b3917355", .65);
  stroke(c, [[12, -32], [8, -7]], "#b391732b", .7);
  c.restore();
}
