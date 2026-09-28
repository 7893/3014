import { stroke } from "./canvas.ts";

// Authored foot positions, in the same local drawing as the seated silhouette.
const steps = [[-10, 7.2], [-9.6, 6.6], [-8.9, 6.1], [-8.3, 6.3],
  [-8.2, 7.0], [-8.7, 7.7], [-9.4, 8.0], [-10, 7.7]] as const;
export const visitorCycle = { frames: 32, seconds: 3.2 };
export function visitorPose(frame: number) {
  const feet: number[] = [];
  for (let leg = 0; leg < 2; leg++) {
    const phase = frame / visitorCycle.frames * steps.length + leg * 2;
    const index = Math.floor(phase) % steps.length, blend = phase % 1;
    const a = steps[index], b = steps[(index + 1) % steps.length];
    feet.push(a[0] + (b[0] - a[0]) * blend + leg * 2,
      a[1] + (b[1] - a[1]) * blend + leg * .3);
  }
  return feet;
}

/** Draw a complete pose once; playback never scales or solves individual limbs. */
export function drawPierVisitor(c: CanvasRenderingContext2D, feet: readonly number[]) {
  c.save(); c.lineCap = "round"; c.lineJoin = "round";
  // Calves are tapered filled shapes. The dress conceals the seated thighs.
  for (const leg of [1, 0]) {
    const x = feet[leg * 2], y = feet[leg * 2 + 1], knee = -4.8 + leg * 2.6;
    c.beginPath(); c.moveTo(knee - 1, .1);
    c.bezierCurveTo(knee - 1.6, 2.5, x - .5, y - 2, x - .65, y - .4);
    c.quadraticCurveTo(x - 1.6, y + .2, x - 1.4, y + .65);
    c.quadraticCurveTo(x + .5, y + 1, x + 1, y + .15);
    c.bezierCurveTo(x + 1.2, y - 1.3, knee + 1.2, 2.8, knee + .9, .1);
    c.closePath(); c.fillStyle = leg ? "#af8d74" : "#c5a084"; c.fill();
    stroke(c, [[x - 1.1, y + .3], [x + .7, y + .3]], "#8ba894", .7);
  }
  // Back-facing shoulders and hair: no profile or face toward the camera.
  const cloth = c.createLinearGradient(-5, -12, 6, 3);
  cloth.addColorStop(0, "#eee1c7"); cloth.addColorStop(1, "#b4b7a2");
  c.beginPath(); c.moveTo(-3.3, -12);
  c.quadraticCurveTo(0, -13, 3.3, -12);
  c.lineTo(3, -5); c.quadraticCurveTo(6, -1, 4.4, 2);
  c.quadraticCurveTo(0, 4, -6, 1.4);
  c.quadraticCurveTo(-5, -2, -3, -5); c.closePath();
  c.fillStyle = cloth; c.fill();
  stroke(c, [[0, -7], [-1, -2], [-3, 1]], "#8e998066", .55);
  stroke(c, [[3.5, -10], [5, -5], [6, 0], [7, .1]], "#c2a083", 1.45);
  stroke(c, [[-3.5, -10], [-5, -5], [-6, -.5], [-7, -.5]], "#bf9b7f", 1.45);
  c.fillStyle = "#4b473d"; c.beginPath(); c.moveTo(-3, -16);
  c.bezierCurveTo(-3.6, -22, 3.6, -22, 3, -16);
  c.quadraticCurveTo(2.5, -12, 3.6, -10);
  c.quadraticCurveTo(0, -8.5, -3.6, -10);
  c.quadraticCurveTo(-2.5, -12, -3, -16); c.fill();
  stroke(c, [[1, -19], [1.8, -14], [2, -11]], "#81725a88", .55);
  c.restore();
}
