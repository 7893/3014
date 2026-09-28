import { BOAT_LANTERN as lamp } from "../config/actors.ts";
import type { Brush } from "./types.ts";
export function paintBoat(
  tools: Brush,
  x: number,
  y: number,
  scale: number,
  crew = true,
) {
  const { ctx, ink, brush, line } = tools;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = ink(0.73);
  ctx.beginPath();
  ctx.moveTo(-24, -2);
  ctx.quadraticCurveTo(0, 6, 25, -3);
  ctx.quadraticCurveTo(14, 8, -10, 6);
  ctx.closePath();
  ctx.fill();
  // The same sheltered passenger travels through every setting.
  ctx.fillStyle = ink(.70);
  ctx.beginPath(); ctx.ellipse(-5, -7.8, 1.4, 1.7, -.15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-6, -9.6, .95, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-5.5, -6.5);
  ctx.quadraticCurveTo(-8, -5, -8, -1);
  ctx.quadraticCurveTo(-4, 1, 1, -1);
  ctx.lineTo(-1, -3); ctx.lineTo(-4, -3);
  ctx.lineTo(-4, -6.5); ctx.closePath(); ctx.fill();
  line([[-4, -5], [-1, -3], [2, -3]], ink(.60), .7);
  // A curved woven canopy shelters the seated figure, with an open side.
  ctx.beginPath(); ctx.moveTo(-13, -2);
  ctx.bezierCurveTo(-13, -17, 5, -19, 8, -2);
  ctx.strokeStyle = ink(.70); ctx.lineWidth = 1.1; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-13, -7);
  ctx.bezierCurveTo(-9, -17, 3, -17, 7, -7);
  ctx.strokeStyle = ink(.32); ctx.lineWidth = 1.6; ctx.stroke();
  line([[-13, -2], [-12, -9]], ink(.6), .8);
  line([[8, -2], [6, -9]], ink(.6), .8);
  // Stern-mounted lantern stays clear of the sheltered passenger.
  line([[lamp.mast, -1], [lamp.mast, lamp.top], [lamp.x, lamp.top], [lamp.x, lamp.y - 2]], ink(.66), .7);
  ctx.fillStyle = ink(.60);
  ctx.fillRect(lamp.x - 1.3, lamp.y - 2, 2.6, 4);
  if (crew) {
    ctx.fillStyle = ink(0.78);
    ctx.beginPath();
    ctx.arc(13, -10, 1.6, 0, Math.PI * 2);
    ctx.fill();
    brush(
      [
        [13, -8],
        [12, -2],
        [17, -1],
      ],
      0.72,
      1.3,
    );
    line(
      [
        [15, -5],
        [31, 7],
      ],
      ink(0.56),
      0.8,
    );
  }
  for (let i = 0; i < 5; i++)
    line(
      [
        [-19 + i * 2, 10 + i * 3],
        [19 - i * 3, 10 + i * 3],
      ],
      ink(0.09 - i * 0.014),
      0.6,
    );
  ctx.restore();
}
