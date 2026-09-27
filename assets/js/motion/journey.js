const SPEED = 0.014;
const DURATION = 5;
export function createJourney(initialX = 0.69) {
  let scene = "ink",
    elapsed = 0,
    startX = initialX,
    transition = null;
  function select(target, instant = false) {
    if (!["ink", "city"].includes(target)) return;
    if (instant) {
      scene = target;
      elapsed = 0;
      startX = target === "ink" ? initialX : 0.3;
      transition = null;
      return;
    }
    if (transition?.to === target || (!transition && scene === target)) return;
    if (transition) {
      scene =
        transition.elapsed < DURATION / 2 ? transition.from : transition.to;
      elapsed = 0;
      startX = scene === "ink" ? initialX : 0.3;
      transition = null;
    }
    if (scene === target) return;
    transition = { from: scene, to: target, elapsed: 0, outgoingX: position() };
  }
  function position() {
    if (scene === "ink") return startX + elapsed * SPEED;
    return -0.06 + ((startX + 0.06 + elapsed * SPEED) % 1.14);
  }
  function advance(dt) {
    if (transition) {
      transition.elapsed = Math.min(DURATION, transition.elapsed + dt);
      if (transition.elapsed >= DURATION) {
        scene = transition.to;
        elapsed = 0;
        startX = scene === "city" ? 0.22 : initialX;
        transition = null;
      }
      return;
    }
    elapsed += dt;
    if (scene === "ink" && position() >= 0.985) select("city");
  }
  function state() {
    if (!transition)
      return {
        scene,
        blend: scene === "city" ? 1 : 0,
        transitioning: false,
        inkX: scene === "ink" ? position() : 1.04,
        cityX: scene === "city" ? position() : 0.22,
      };
    const p = transition.elapsed / DURATION,
      s = p * p * (3 - 2 * p);
    return {
      scene: p < 0.5 ? transition.from : transition.to,
      blend: transition.to === "city" ? s : 1 - s,
      transitioning: true,
      inkX:
        transition.from === "ink"
          ? transition.outgoingX + transition.elapsed * SPEED
          : initialX,
      cityX:
        transition.from === "city"
          ? transition.outgoingX + transition.elapsed * SPEED
          : 0.07 + transition.elapsed * 0.03,
    };
  }
  return { advance, select, state };
}
