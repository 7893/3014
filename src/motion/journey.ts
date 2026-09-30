import { createTimeline, engine } from "animejs";
import type { SceneName, JourneyState } from "../scenes/types.ts";
import { sceneOrder, publicScenes } from "../config/scenes.ts";

engine.useDefaultMainLoop = false;
const SPEED = 0.014;
export const scenes = publicScenes;

export function createJourney(initialX = 0.69, random = Math.random) {
  let scene = scenes[Math.floor(random() * scenes.length)];
  let from = scene,
    to = scene,
    transitioning = false;
  const position = { outgoing: initialX, incoming: 0.07, blend: 0 };
  let motion: ReturnType<typeof createTimeline>;
  function next() {
    return scenes[(scenes.indexOf(scene) + 1) % scenes.length];
  }
  function cruise(x: number) {
    motion?.cancel();
    from = to = scene;
    transitioning = false;
    Object.assign(position, { outgoing: x, blend: 0 });
    motion = createTimeline({
      autoplay: false,
      onComplete: () => select(next()),
    }).add(position, {
      outgoing: 0.985,
      duration: ((0.985 - x) / SPEED) * 1000,
      ease: "linear",
    });
  }
  function select(target: SceneName, instant = false) {
    if (!sceneOrder.includes(target) && target !== "room") return;
    if (instant) {
      scene = target;
      cruise(initialX);
      return;
    }
    if (to === target) return;
    let x = position.outgoing;
    if (transitioning) {
      scene = position.blend < 0.5 ? from : to;
      x = 0.3;
    }
    if (scene === target) {
      cruise(x);
      return;
    }
    motion.cancel();
    from = scene;
    to = target;
    transitioning = true;
    Object.assign(position, { outgoing: x, incoming: 0.07, blend: 0 });
    motion = createTimeline({
      autoplay: false,
      onComplete: () => {
        scene = target;
        cruise(0.22);
      },
    }).add(position, {
      outgoing: x + 5 * SPEED,
      incoming: 0.22,
      blend: { from: 0, to: 1, ease: (p: number) => p * p * (3 - 2 * p) },
      duration: 5000,
      ease: "linear",
    });
  }
  cruise(initialX);
  return {
    select,
    advance(dt: number) {
      if (scene !== "room" || transitioning) motion.seek(motion.currentTime + dt * 1000);
    },
    dispose() {
      motion.cancel();
    },
    state(): JourneyState {
      return {
        scene: transitioning && position.blend >= 0.5 ? to : from,
        from,
        to,
        transitioning,
        blend: position.blend,
        positions: transitioning
          ? { [from]: position.outgoing, [to]: position.incoming }
          : { [from]: position.outgoing },
      };
    },
  };
}
