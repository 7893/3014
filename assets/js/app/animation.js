// Monitor actual animation callbacks as well as CPU submission cost.
export function createCadence() {
  let fps = 60,
    interval = 16.67,
    cost = 0,
    windowTime = 0;
  return {
    get fps() {
      return fps;
    },
    sample(delta, renderCost) {
      if (delta <= 0 || delta > 150) return;
      interval += (delta - interval) * 0.05;
      if (renderCost !== null) cost += (renderCost - cost) * 0.08;
      windowTime += delta;
      if (fps === 60 && windowTime > 2500 && (interval > 23 || cost > 13)) {
        fps = 30;
        windowTime = 0;
      } else if (
        fps === 30 &&
        windowTime > 10000 &&
        interval < 19 &&
        cost < 8
      ) {
        fps = 60;
        windowTime = 0;
      }
    },
    reset() {
      interval = 16.67;
      cost = 0;
      windowTime = 0;
    },
  };
}
export function createAnimation({ active, advance, draw, onRate }) {
  const cadence = createCadence();
  let frame = 0,
    last = null,
    due = 0,
    lastRate = null;
  function tick(now) {
    frame = 0;
    if (!active()) return;
    const delta = last === null ? 0 : now - last;
    last = now;
    advance(Math.min(delta / 1000, 0.25));
    let cost = null;
    if (now + 0.5 >= due) {
      const start = performance.now();
      draw();
      cost = performance.now() - start;
      const period = 1000 / cadence.fps;
      due = due ? due + period : now + period;
      if (due <= now) due = now + period;
    }
    cadence.sample(delta, cost);
    if (lastRate !== cadence.fps) {
      lastRate = cadence.fps;
      onRate(lastRate);
    }
    frame = requestAnimationFrame(tick);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = null;
    due = 0;
  }
  function sync() {
    stop();
    cadence.reset();
    if (active()) frame = requestAnimationFrame(tick);
  }
  return { stop, sync };
}
