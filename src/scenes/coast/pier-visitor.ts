import { PIER_VISITOR } from "../../config/actors.ts";
import { drawPierVisitor, visitorPose } from "../../drawing/pier-visitor.ts";
import { pier } from "./pier.ts";

export function paintPierVisitor(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const scale = Math.min(width, height) / PIER_VISITOR.sizeDivisor;
  ctx.save(); ctx.translate(width * pier.seatX, height * pier.seatY); ctx.scale(scale, scale);
  drawPierVisitor(ctx, visitorPose(0));
  ctx.restore();
}
