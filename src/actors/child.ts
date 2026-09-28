import { Container, Graphics } from "pixi.js";
import { createTimeline } from "animejs";
import { BEACH_RUN } from "../config/actors.ts";

/** Rounded volumes and changing limb depth turn the child without flattening it. */
export function createRunningChild(index: number) {
  const root = new Container(); root.position.set(32 + index * 64, 57);
  const shadow = new Graphics().ellipse(0, 1, 7, 1.6).fill({ color: 0x665a3a, alpha: .16 });
  root.addChild(shadow);
  const torso = new Container({ label: "runner-body" }); torso.position.y = -14; torso.sortableChildren = true; root.addChild(torso);
  const motion = createTimeline({ autoplay: false, defaults: { duration: 800, ease: "inOutSine" } });
  const limbs: { hip: Container; shoulder: Container; side: number }[] = [];
  for (let side = 0; side < 2; side++) {
    const hip = new Container(), knee = new Container(), shoulder = new Container(), elbow = new Container();
    hip.addChild(new Graphics().moveTo(0, 0).lineTo(0, 6)
      .stroke({ color: side ? 0xb38d67 : 0x927353, width: 2.7, cap: "round" }));
    knee.position.y = 6;
    knee.addChild(new Graphics().moveTo(0, 0).lineTo(0, 5.4)
      .stroke({ color: 0xbb9673, width: 2.1, cap: "round" })
      .ellipse(1, 5.8, 2.5, 1.1).fill(0xe0ccb0));
    hip.addChild(knee); torso.addChild(hip);
    shoulder.position.y = -7;
    shoulder.addChild(new Graphics().moveTo(0, 0).lineTo(0, 4.2)
      .stroke({ color: 0xb9926b, width: 2, cap: "round" }));
    elbow.position.y = 4.2; elbow.rotation = -1;
    elbow.addChild(new Graphics().moveTo(0, 0).lineTo(0, 3.8)
      .stroke({ color: 0xc6a07c, width: 1.7, cap: "round" }));
    shoulder.addChild(elbow); torso.addChild(shoulder);
    const sign = side ? -1 : 1;
    motion.add(hip, { rotation: [-.70 * sign, .72 * sign, -.70 * sign] }, 0);
    motion.add(knee, { rotation: side ? [.75, .14, .24, 1.2, .75] : [.24, 1.2, .75, .14, .24] }, 0);
    motion.add(shoulder, { rotation: [.55 * sign, -.55 * sign, .55 * sign] }, 0);
    limbs.push({ hip, shoulder, side });
  }
  const body = new Graphics().ellipse(0, -4.5, 3.7, 5.8).fill(index ? 0xc3a26d : 0x758c88)
    .ellipse(-1, -5.5, 1.5, 4).fill({ color: 0xe6d5ad, alpha: .18 })
    .roundRect(-3.5, -.5, 7, 3.5, 1).fill(index ? 0x777c65 : 0x77715b);
  body.zIndex = 2; torso.addChild(body);
  const head = new Container(); head.position.y = -13; head.zIndex = 3;
  head.addChild(new Graphics().ellipse(0, 0, 3.1, 3.5).fill(0xc29c77)
    .ellipse(-.8, -.6, 1.7, 2.5).fill({ color: 0xe1ba8b, alpha: .30 }));
  const hair = new Graphics().ellipse(0, -1.7, 3.2, 2).fill(0x524b3a);
  const nose = new Graphics({ label: "runner-nose" }).ellipse(0, 0, .9, 1).fill(0xc8a17d);
  head.addChild(nose, hair); torso.addChild(head);
  motion.add(torso.position, { y: [-14, -15.4, -14, -15.4, -14] }, 0);
  return {
    root,
    update(time: number) {
      const phase = time * BEACH_RUN.speed - index * BEACH_RUN.lag, heading = Math.cos(phase);
      const half = Math.floor((phase + Math.PI / 2) / Math.PI), progress = phase + Math.PI / 2 - half * Math.PI;
      const distance = half * 2 + 1 - Math.cos(progress);
      const gait = ((distance * 5.5 + index * .35) % 1 + 1) % 1;
      motion.seek(gait * 800, true);
      torso.scale.x = heading < 0 ? -1 : 1;
      torso.rotation = -heading * .075;
      // Reflect the complete pose together: knees, elbows, toes and face agree.
      // Scale magnitude stays one; turns never flatten the silhouette.
      for (const { hip, shoulder, side } of limbs) {
        const sign = side ? 1 : -1, depth = Math.sin(phase) * sign;
        hip.position.x = sign * (1.5 + .5 * Math.abs(Math.sin(phase)));
        shoulder.position.x = sign * 2.7;
        hip.zIndex = depth > 0 ? 3 : 0; shoulder.zIndex = depth > 0 ? 4 : 1;
      }
      nose.x = Math.abs(heading) * 2.8; nose.alpha = Math.abs(heading) * .8;
      hair.scale.y = 1 + .55 * Math.max(0, Math.sin(phase));
      head.rotation = Math.abs(heading) * .09; shadow.scale.x = 1 + (torso.y + 14) * .06;
    },
    dispose() { motion.cancel(); },
  };
}
