import { Container, Graphics, RenderTexture } from "pixi.js";
import type { WebGLRenderer } from "pixi.js";
import { createTimeline } from "animejs";

// Two local poses share one tiny atlas; running never allocates viewport textures.
export function createBeachActors() {
  const root = new Container();
  const motions: ReturnType<typeof createTimeline>[] = [];
  for (let i = 0; i < 2; i++) {
    const child = new Container();
    child.position.set(32 + i * 64, 57);
    root.addChild(child);
    const shadow = new Graphics().ellipse(0, 1, 9, 2).fill({ color: 0x665a3a, alpha: .19 });
    child.addChild(shadow);
    const torso = new Container();
    torso.position.y = -14;
    child.addChild(torso);
    torso.addChild(new Graphics().roundRect(-3, -9, 6, 10, 2)
      .fill(i ? 0xc4a56c : 0x758b8b)
      .circle(0, -13, 3).fill(0xb88c63)
      .ellipse(-.3, -15, 3.2, 1.6).fill(0x554e3b));
    const limbs: Container[] = [];
    for (let j = 0; j < 4; j++) {
      const joint = new Container();
      const leg = j < 2;
      joint.position.set(j % 2 ? 1.5 : -1.5, leg ? 0 : -7);
      joint.addChild(new Graphics().moveTo(0, 0)
        .lineTo(leg ? 1 : 2, leg ? 7 : 4)
        .lineTo(leg ? -1 : 5, leg ? 13 : 5)
        .stroke({ color: leg ? 0x817252 : 0xb88c63, width: leg ? 2.2 : 1.8, cap: "round", join: "round" }));
      torso.addChildAt(joint, 0); limbs.push(joint);
    }
    const duration = 720 + i * 70;
    const motion = createTimeline({ autoplay: false, defaults: { duration, ease: "inOutSine" } });
    limbs.forEach((limb, j) => {
      const sign = j % 2 ? -1 : 1;
      motion.add(limb, { rotation: [-.65 * sign, .65 * sign, -.65 * sign] }, 0);
    });
    motion.add(torso.position, { y: [-14, -16, -14, -16, -14] }, 0);
    motions.push(motion);
  }
  const texture = RenderTexture.create({ width: 128, height: 64, resolution: 2 });
  return {
    texture,
    draw(renderer: WebGLRenderer, time: number) {
      motions.forEach((motion, i) => motion.seek((time * 1000 + i * 240) % (720 + i * 70), true));
      renderer.render({ container: root, target: texture, clear: true, clearColor: [0, 0, 0, 0] });
    },
    dispose() {
      motions.forEach(motion => motion.cancel());
      root.destroy({ children: true }); texture.destroy(true);
    },
  };
}
