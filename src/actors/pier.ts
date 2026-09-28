import { PIER_VISITOR as pose } from "../config/actors.ts";
import { Container, Graphics } from "pixi.js";
import { createTimeline } from "animejs";
import { pier } from "../scenes/coast/pier.ts";

/** Small atlas actor; Anime moves the feet, Pixi transforms the articulated legs. */
export function createPierVisitor() {
  const root = new Container(); root.position.set(160, 21);
  const feet = new Float32Array(4);
  const motions: ReturnType<typeof createTimeline>[] = [];
  const legs: Graphics[] = [];
  const duration = 3600;
  for (let i = 0; i < 2; i++) {
    const hipX = (i * 2 - 1) * pose.hip, kneeX = pose.kneeX + hipX;
    root.addChild(new Graphics().moveTo(hipX, -2).lineTo(kneeX, pose.kneeY)
      .stroke({ color: 0xb8926e, width: 1.9, cap: "round" }));
    // A fixed-length bone rotates; neither the limb nor its round caps stretch.
    const lower = new Graphics().moveTo(0, 0).lineTo(pose.shin, 0)
      .stroke({ color: 0xb8926e, width: 1.7, cap: "round" })
      .ellipse(pose.shin, 0, 1.25, .8).fill(0x8ba885);
    lower.position.set(kneeX, pose.kneeY); root.addChild(lower);
    motions.push(createTimeline({ autoplay: false, defaults: { duration, ease: "inOutSine" } })
      .add(lower, { rotation: [2.35, 2.65, 2.35] }, 0));
    legs.push(lower);
  }
  const torso = new Graphics().moveTo(-3, -11).quadraticCurveTo(-5, -8, -4, -3)
    .lineTo(-5, .5).quadraticCurveTo(0, 2, 5, .5).lineTo(4, -3)
    .quadraticCurveTo(5, -8, 3, -11).closePath().fill(0xc7aba0);
  root.addChild(torso, new Graphics().moveTo(-3.5, -8).lineTo(-5, -3).lineTo(-7, 0)
    .moveTo(3.5, -8).lineTo(5, -3).lineTo(7, 0)
    .stroke({ color: 0xb99879, width: 1.4, cap: "round" }),
  new Graphics().ellipse(0, -14, 3, 4).fill(0x49493e)
    .roundRect(-3.5, -14, 7, 8, 2).fill(0x49493e));
  return {
    root, feet,
    update(time: number, width: number, height: number) {
      const scale = Math.min(width, height) / pose.sizeDivisor;
      for (let i = 0; i < legs.length; i++) {
        motions[i].seek((time * 1000 + i * duration * .3) % duration, true);
        const lower = legs[i];
        feet[i * 2] = pier.seatX + (lower.x + Math.cos(lower.rotation) * pose.shin) * scale / width;
        feet[i * 2 + 1] = pier.seatY + (lower.y + Math.sin(lower.rotation) * pose.shin) * scale / height;
      }
    },
    dispose() { motions.forEach(motion => motion.cancel()); },
  };
}
