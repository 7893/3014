import { PIER_VISITOR as pose } from "../../config/actors.ts";
import { pier } from "./pier.ts";
import { stroke } from "../../drawing/canvas.ts";

export function paintPierVisitor(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.save(); ctx.translate(W * pier.seatX, H * pier.seatY);
  const scale = Math.min(W, H) / pose.sizeDivisor;
  ctx.scale(scale, scale);
  ctx.fillStyle = "#544d3c33";
  ctx.beginPath(); ctx.ellipse(0, 1.5, 5.5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
  for (const side of [-1, 1]) {
    const hip = side * pose.hip, knee = pose.kneeX + hip;
    const fx = knee + Math.cos(2.5) * pose.shin, fy = pose.kneeY + Math.sin(2.5) * pose.shin;
    ctx.lineCap = "round";
    stroke(ctx, [[hip, -2], [knee, pose.kneeY], [fx, fy]], "#b8926e", 1.7);
    ctx.fillStyle = "#8ba885";
    ctx.beginPath(); ctx.ellipse(fx, fy, 1.25, .8, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  // Facing the water: a seated back, relaxed shoulders, hands resting on the edge.
  ctx.fillStyle = "#c7aba0";
  ctx.beginPath(); ctx.moveTo(-3, -11);
  ctx.quadraticCurveTo(-5, -8, -4, -3);
  ctx.lineTo(-5, .5); ctx.quadraticCurveTo(0, 2, 5, .5);
  ctx.lineTo(4, -3); ctx.quadraticCurveTo(5, -8, 3, -11);
  ctx.closePath(); ctx.fill();
  stroke(ctx, [[-3.5, -8], [-5, -3], [-7, 0]], "#b99879", 1.4);
  stroke(ctx, [[3.5, -8], [5, -3], [7, 0]], "#b99879", 1.4);
  ctx.fillStyle = "#49493e";
  ctx.beginPath(); ctx.moveTo(-2.8, -14);
  ctx.bezierCurveTo(-2.5, -18, 3, -18, 3, -14);
  ctx.lineTo(3.5, -7); ctx.quadraticCurveTo(0, -5, -3.5, -7);
  ctx.closePath(); ctx.fill();
  stroke(ctx, [[1, -15], [1.7, -8]], "#79705a", .55);
  ctx.restore();
}
