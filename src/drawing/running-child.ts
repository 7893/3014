import { stroke } from "./canvas.ts";
import type { RunPose } from "../motion/run-cycle.ts";

/** Complete side-view poses keep the planted feet independent of the body bounce. */
export function drawRunningChild(c: CanvasRenderingContext2D, front: RunPose, back: RunPose, palette: number, resting = false) {
  const hip = (front.hip + back.hip) / 2, shoulder = hip - 7;
  c.save(); c.lineCap = "round"; c.lineJoin = "round";
  c.fillStyle = "#665a3a26"; c.beginPath(); c.ellipse(0, 2, 6, 1.1, 0, 0, Math.PI * 2); c.fill();
  for (const [pose, far] of [[back, true], [front, false]] as const) {
    stroke(c, [[0, hip], [pose.kneeX, pose.kneeY]], far ? "#a58365" : "#c19a76", 3);
    stroke(c, [[pose.kneeX, pose.kneeY], [pose.footX, pose.footY - 1]], far ? "#a58365" : "#c6a17b", 2.1);
    c.fillStyle = far ? "#c1b392" : "#e0ccb0";
    c.beginPath(); c.ellipse(pose.footX + 1.2, pose.footY, 2, .9, -.05, 0, Math.PI * 2); c.fill();
    if (far) {
      const swing = -pose.footX * .45;
      stroke(c, [[1, shoulder], [swing, shoulder + 4], [swing + 3, shoulder + 3]], "#a58365", 1.8);
    }
  }
  c.fillStyle = palette ? "#bd9b68" : "#738d89";
  c.beginPath(); c.moveTo(-2, shoulder - 1); c.quadraticCurveTo(1, shoulder - 2, 3, shoulder);
  c.lineTo(3, hip + 1); c.quadraticCurveTo(0, hip + 3, -3, hip + 1); c.closePath(); c.fill();
  stroke(c, [[-1, shoulder], [-1.2, hip - 1]], "#e1d5af44", 1.4);
  stroke(c, [[-2, hip + 1], [2, hip + 1]], palette ? "#737b63" : "#74705d", 3);
  const swing = -front.footX * .45;
  stroke(c, [[1, shoulder + .5], [swing, shoulder + 4], [swing + 3, shoulder + 3]], "#c6a17b", 2);
  const headY = shoulder - 4;
  c.fillStyle = "#c8a37e"; c.beginPath(); c.ellipse(1, headY, 2.7, 3, .06, 0, Math.PI * 2); c.fill();
  if (!resting) {
    c.beginPath(); c.ellipse(3.4, headY + .4, .8, .7, 0, 0, Math.PI * 2); c.fill();
  }
  c.fillStyle = "#514b3c"; c.beginPath(); c.ellipse(.7, headY - 1.6, 2.9, 1.8, -.1, 0, Math.PI * 2); c.fill();
  c.restore();
}
