import { Container, Graphics } from "pixi.js";
import { createTimeline } from "animejs";
import { pier } from "../scenes/coast/pier.ts";

/** Small atlas actor; Anime moves the feet, Pixi transforms the articulated legs. */
export function createPierVisitor() {
  const root = new Container(); root.position.set(160, 21);
  const feet = new Float32Array(4);
  const motions: ReturnType<typeof createTimeline>[] = [];
  const legs: { lower: Graphics; foot: Graphics }[] = [];
  const duration = 3600;
  const footX = (pier.footX - pier.seatX) * 1000, footY = (pier.water - pier.seatY) * 1000;
  for (let i = 0; i < 2; i++) {
    const side = i * 2 - 1, hipX = side * 2.8, kneeX = -14 + side * 2.8;
    root.addChild(new Graphics().moveTo(hipX, -2).lineTo(kneeX, 10)
      .stroke({ color: 0xb8926e, width: 1.9, cap: "round" }));
    const lower = new Graphics().moveTo(0, 0).lineTo(1, 0)
      .stroke({ color: 0xb8926e, width: 1.7, cap: "round" });
    lower.position.set(kneeX, 10); root.addChild(lower);
    const foot = new Graphics().moveTo(0, 0).lineTo(-3, 1)
      .stroke({ color: 0x8ba885, width: 1.8, cap: "round" });
    foot.position.set(footX + hipX, footY); root.addChild(foot);
    motions.push(createTimeline({ autoplay: false, defaults: { duration, ease: "inOutSine" } })
      .add(foot.position, { x: [footX - 2.5 + hipX, footX + 2.5 + hipX, footX - 2.5 + hipX], y: [footY - 1.8, footY + 1.8, footY - 1.8] }, 0));
    legs.push({ lower, foot });
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
    update(time: number) {
      for (let i = 0; i < legs.length; i++) {
        motions[i].seek((time * 1000 + i * duration * .3) % duration, true);
        const { lower, foot } = legs[i], dx = foot.x - lower.x, dy = foot.y - lower.y;
        lower.rotation = Math.atan2(dy, dx); lower.scale.x = Math.hypot(dx, dy);
        feet[i * 2] = pier.seatX + foot.x / 1000;
        feet[i * 2 + 1] = pier.seatY + foot.y / 1000;
      }
    },
    dispose() { motions.forEach(motion => motion.cancel()); },
  };
}
