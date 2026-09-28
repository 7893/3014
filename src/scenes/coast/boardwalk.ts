import { pier } from "./pier.ts";
import { stroke } from "../../drawing/canvas.ts";
import type { Points } from "../../drawing/types.ts";

export function drawBoardwalk(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  shape: (points: Points, fill: string) => void,
) {
  const edge = (t: number, right = false) => W * (right ? pier.right + t * (.995 - pier.right) : pier.left + t * (.89 - pier.left));
  const level = (t: number, right = false) => H * (pier.top + (right ? pier.slope * (1 - t) : 0) + t * (1 - pier.top));
  // Cast shadows, paired posts, and diagonal bracing beneath the deck.
  for (let i = 0; i < 5; i++) {
    const t = i / 5, y = level(t), drop = H * (pier.drop + t * .008);
    for (const right of [false, true]) {
      const x = edge(t, right), y = level(t, right), thick = 2 + t * 2;
      ctx.fillStyle = "rgba(74,67,44,.18)";
      ctx.beginPath(); ctx.ellipse(x + 5, y + drop, 8 + t * 6, 2, -.2, 0, Math.PI * 2); ctx.fill();
      shape([[x - thick, y], [x + thick, y], [x + thick, y + drop], [x - thick, y + drop]], "#685a40");
      stroke(ctx, [[x - thick, y], [x - thick, y + drop]], "#b3a079", .8);
      // Keep the end bay open below the sitter; bracing starts one bay inland.
      if (i > 0 && i < 4) {
        const nx = edge(t + .2, right), ny = level(t + .2, right);
        stroke(ctx, [[x, y + drop * .85], [nx, ny + 2]], "#7f6d4b", 2);
      }
    }
    stroke(ctx, [[edge(t), y + drop * .55], [edge(t, true), level(t, true) + drop * .55]], "#685a40", 2.2);
  }
  shape([[edge(1), H], [edge(1, true), H], [edge(0, true), level(0, true)], [edge(0), level(0)]], "#a18b60");
  // Leave a thin open landing at the end; the deeper side beam begins behind it.
  const beamStart = .12;
  shape([[edge(beamStart), level(beamStart)], [edge(1), H], [edge(1) - 3, H],
    [edge(beamStart) - 2, level(beamStart) + 4]], "#65583e");
  shape([[edge(0, true), level(0, true)], [edge(1, true), H], [edge(1, true) + 3, H], [edge(0, true) + 2, level(0, true) + 4]], "#7b6847");
  for (let i = 0; i < 17; i++) {
    const t = i / 17, y = level(t), left = edge(t), right = edge(t, true);
    stroke(ctx, [[left, y], [right, level(t, true)]], "rgba(62,57,37,.45)", .8);
    stroke(ctx, [[left, y + 1], [right, level(t, true) + 1]], "rgba(235,214,171,.22)", .7);
  }
}
