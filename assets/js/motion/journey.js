const SPEED = 0.014;
const DURATION = 5;
export const scenes = ["ink", "city", "coast"];
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
  let scene = queue.shift(),
    elapsed = 0,
    startX = initialX,
    transition = null;
  function nextScene() {
    if (!queue.length) {
      queue = shuffle();
      if (queue[0] === scene) [queue[0], queue[1]] = [queue[1], queue[0]];
    }
    return queue.shift();
  }
  function select(target, instant = false, automatic = false) {
    if (!scenes.includes(target)) return;
    if (!automatic) queue = shuffle().filter((name) => name !== target);
    if (instant) {
      scene = target;
      elapsed = 0;
      startX = initialX;
      transition = null;
      return;
    }
    if (transition?.to === target || (!transition && scene === target)) return;
    if (transition) {
      scene =
        transition.elapsed < DURATION / 2 ? transition.from : transition.to;
      elapsed = 0;
      startX = 0.3;
      transition = null;
    }
    if (scene === target) return;
    transition = { from: scene, to: target, elapsed: 0, outgoingX: position() };
  }
  function position() {
    return startX + elapsed * SPEED;
  }
  function advance(dt) {
    if (transition) {
      transition.elapsed = Math.min(DURATION, transition.elapsed + dt);
      if (transition.elapsed >= DURATION) {
        scene = transition.to;
        elapsed = 0;
        startX = 0.22;
        transition = null;
      }
      return;
    }
    elapsed += dt;
    if (position() >= 0.985) select(nextScene(), false, true);
  }
  function state() {
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
      blend: p * p * (3 - 2 * p),
      transitioning: true,
      positions: {
        [transition.from]: transition.outgoingX + transition.elapsed * SPEED,
        [transition.to]: 0.07 + transition.elapsed * 0.03,
      },
    };
  }
  return { advance, select, state };
}
