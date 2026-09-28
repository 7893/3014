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
  // Three-quarter back view: a loose linen dress, bent hips and a supported hand.
  const cloth = c.createLinearGradient(-5, -12, 6, 3);
  cloth.addColorStop(0, "#eee1c7"); cloth.addColorStop(1, "#b4b7a2");
  c.beginPath(); c.moveTo(-1.4, -12);
  c.bezierCurveTo(-4.5, -11.3, -3.1, -6.5, -4.2, -3.6);
  c.quadraticCurveTo(-5.6, -1.6, -6.2, 1.2);
  c.quadraticCurveTo(-2.7, 3.8, 3.9, 2);
  c.quadraticCurveTo(5.6, .6, 3.5, -3);
  c.lineTo(3.9, -9.5); c.quadraticCurveTo(2.6, -12, -1.4, -12);
  c.fillStyle = cloth; c.fill();
  stroke(c, [[-.5, -6.5], [-1.5, -.4], [-3.3, 1.2]], "#8e998066", .55);
  stroke(c, [[3.4, -9], [5.2, -4.8], [5.8, -.5], [7, .1]], "#c2a083", 1.45);
  stroke(c, [[-2.7, -8.8], [-4.7, -4.7], [-5.9, -2.2]], "#bf9b7f", 1.25);
  c.fillStyle = "#c7a487"; c.beginPath(); c.ellipse(-.4, -15.3, 2.65, 3.35, -.16, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#4b473d"; c.beginPath(); c.moveTo(-2.8, -17.2);
  c.bezierCurveTo(-2.5, -21.6, 4.1, -21, 4, -16.5);
  c.quadraticCurveTo(3.1, -12.2, 4.5, -9.6);
  c.quadraticCurveTo(.5, -8.2, -2.4, -10.8);
  c.quadraticCurveTo(-.4, -14.7, -2.8, -17.2); c.fill();
  stroke(c, [[2, -18], [2.2, -13], [2.9, -10.3]], "#81725a88", .55);
  c.restore();
}
