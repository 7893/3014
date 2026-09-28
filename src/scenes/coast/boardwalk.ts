import { pier } from "./pier.ts";
import { stroke } from "../../drawing/canvas.ts";
import type { Points } from "../../drawing/types.ts";

export function drawBoardwalk(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  shape: (points: Points, fill: string) => void,
) {
  const deck = (a: number[], b: number[], c: number[], d: number[], boards: number) => {
    const point = (p: number[]) => [p[0] * W, p[1] * H] as [number, number];
    shape([point(a), point(b), point(c), point(d)], "#a18b60");
    for (let i = 0; i <= boards; i++) {
      const t = i / boards;
      const left = point([a[0] + (d[0] - a[0]) * t, a[1] + (d[1] - a[1]) * t]);
      const right = point([b[0] + (c[0] - b[0]) * t, b[1] + (c[1] - b[1]) * t]);
      stroke(ctx, [left, right], "#65583e88", .8);
      stroke(ctx, [[left[0], left[1] + 1], [right[0], right[1] + 1]], "#ebd6ab44", .7);
    }
  };
  // A narrow approach meets a wider landing. Posts sit behind its open front edge.
  for (const [x, y] of [[.795, .736], [.855, .757], [.843, .86], [.92, .88], [.89, .97], [.98, .98]]) {
    const drop = H * .014;
    shape([[x * W - 2, y * H], [x * W + 2, y * H],
      [x * W + 2, y * H + drop], [x * W - 2, y * H + drop]], "#685a40");
    stroke(ctx, [[x * W - 1, y * H], [x * W - 1, y * H + drop]], "#b3a079", .8);
  }
  deck([.825, .765], [.85, .775], [.995, 1], [.89, 1], 19);
  deck([pier.left, pier.top], [pier.right, pier.top + pier.slope], [.855, .757], [.795, .736], 8);
}
