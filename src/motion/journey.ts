import {
  createTransition,
  TRANSITION_SECONDS as DURATION,
} from "./transition.ts";
import type { SceneName, JourneyState } from "../scenes/types.ts";
const SPEED = 0.014;
export const scenes: SceneName[] = ["ink", "city", "coast"];
export function createJourney(initialX = 0.69, random = Math.random) {
  function shuffle() {
    const order = [...scenes];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }
  let queue = shuffle();
  let scene = queue.shift()!,
    elapsed = 0,
    startX = initialX,
    transition: {
      from: SceneName;
      to: SceneName;
      elapsed: number;
      motion: ReturnType<typeof createTransition>;
    } | null = null;
  function nextScene() {
    if (!queue.length) {
      queue = shuffle();
      if (queue[0] === scene) [queue[0], queue[1]] = [queue[1], queue[0]];
    }
    return queue.shift()!;
  }
  function select(target: SceneName, instant = false, automatic = false) {
    if (!scenes.includes(target)) return;
    if (!automatic) queue = shuffle().filter((name) => name !== target);
    if (instant) {
      scene = target;
      elapsed = 0;
      startX = initialX;
      transition?.motion.dispose();
      transition = null;
      return;
    }
    if (transition?.to === target || (!transition && scene === target)) return;
    if (transition) {
      scene =
        transition.elapsed < DURATION / 2 ? transition.from : transition.to;
      elapsed = 0;
      startX = 0.3;
      transition?.motion.dispose();
      transition = null;
    }
    if (scene === target) return;
    transition = {
      from: scene,
      to: target,
      elapsed: 0,
      motion: createTransition(position(), SPEED),
    };
  }
  function position() {
    return startX + elapsed * SPEED;
  }
  function advance(dt: number) {
    if (transition) {
      transition.elapsed = Math.min(DURATION, transition.elapsed + dt);
      transition.motion.seek(transition.elapsed);
      if (transition.elapsed >= DURATION) {
        scene = transition.to;
        elapsed = 0;
        startX = 0.22;
        transition?.motion.dispose();
        transition = null;
      }
      return;
    }
    elapsed += dt;
    if (position() >= 0.985) select(nextScene(), false, true);
  }
  function state(): JourneyState {
    if (!transition)
      return {
        scene,
        from: scene,
        to: scene,
        blend: 0,
        transitioning: false,
        positions: { [scene]: position() },
      };
    const p = transition.elapsed / DURATION;
    return {
      scene: p < 0.5 ? transition.from : transition.to,
      from: transition.from,
      to: transition.to,
      blend: transition.motion.values.blend,
      transitioning: true,
      positions: {
        [transition.from]: transition.motion.values.outgoing,
        [transition.to]: transition.motion.values.incoming,
      },
    };
  }
  return { advance, select, state };
}
