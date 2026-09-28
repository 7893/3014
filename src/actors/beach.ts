import { Container, Graphics, RenderTexture } from "pixi.js";
import type { WebGLRenderer } from "pixi.js";
import { createTimeline } from "animejs";

// Two articulated poses share a small atlas and the application's animation clock.
export function createBeachActors() {
  const root = new Container();
  const motions: ReturnType<typeof createTimeline>[] = [];
  const bodies: Container[] = [];
  for (let i = 0; i < 2; i++) {
    const child = new Container();
    child.position.set(32 + i * 64, 57);
    root.addChild(child);
    child.addChild(new Graphics().ellipse(0, 1, 8, 1.8)
      .fill({ color: 0x665a3a, alpha: .17 }));
    const torso = new Container();
    torso.position.y = -14;
    child.addChild(torso); bodies.push(torso);
    const motion = createTimeline({ autoplay: false,
      defaults: { duration: 800, ease: "inOutSine" } });
    for (let side = 0; side < 2; side++) {
      const hip = new Container(), knee = new Container();
      hip.position.x = side ? 1.2 : -1.2;
      hip.addChild(new Graphics().moveTo(0, 0).lineTo(0, 6.5)
        .stroke({ color: 0x817252, width: 2.4, cap: "round" }));
      knee.position.y = 6.5;
      knee.addChild(new Graphics().moveTo(0, 0).lineTo(0, 6)
        .lineTo(2, 6).stroke({ color: 0xb18c64, width: 1.8, cap: "round" }));
      hip.addChild(knee); torso.addChild(hip);
      const shoulder = new Container(), elbow = new Container();
      shoulder.position.set(side ? 2 : -2, -7);
      shoulder.addChild(new Graphics().moveTo(0, 0).lineTo(0, 4)
        .stroke({ color: 0xb88c63, width: 1.8, cap: "round" }));
      elbow.position.y = 4;
      elbow.rotation = -1.1;
      elbow.addChild(new Graphics().moveTo(0, 0).lineTo(0, 4)
        .stroke({ color: 0xb88c63, width: 1.5, cap: "round" }));
      shoulder.addChild(elbow); torso.addChild(shoulder);
      const sign = side ? -1 : 1;
      motion.add(hip, { rotation: [-.75 * sign, .7 * sign, -.75 * sign] }, 0);
      motion.add(knee, { rotation: side ? [.85, .16, .22, 1.35, .85] : [.22, 1.35, .85, .16, .22] }, 0);
      motion.add(shoulder, { rotation: [.6 * sign, -.6 * sign, .6 * sign] }, 0);
    }
    torso.addChild(new Graphics().roundRect(-3, -9, 6, 10, 2)
      .fill(i ? 0xc4a56c : 0x758b8b)
      .circle(.6, -13, 2.8).fill(0xb88c63)
      .ellipse(.2, -15, 3, 1.5).fill(0x554e3b));
    motion.add(torso.position, { y: [-14, -15.5, -14, -15.5, -14] }, 0);
    motions.push(motion);
  }
  const texture = RenderTexture.create({ width: 128, height: 64, resolution: 2 });
  return {
    texture,
    draw(renderer: WebGLRenderer, time: number) {
      for (let i = 0; i < motions.length; i++) {
        const phase = time * .27 - i * .55;
        // Integrated travel distance synchronizes the steps with slowing and turning.
        const half = Math.floor((phase + Math.PI / 2) / Math.PI);
        const progress = phase + Math.PI / 2 - half * Math.PI;
        const distance = half * 2 + 1 - Math.cos(progress);
        const gait = ((distance * 5.5 + i * .35) % 1 + 1) % 1;
        motions[i].seek(gait * 800, true);
        bodies[i].rotation = .09 * Math.abs(Math.cos(phase));
      }
      renderer.render({ container: root, target: texture, clear: true, clearColor: [0, 0, 0, 0] });
    },
    dispose() {
      motions.forEach(motion => motion.cancel());
      root.destroy({ children: true }); texture.destroy(true);
    },
  };
}
