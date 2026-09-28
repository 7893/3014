import type { SceneName } from "../scenes/types.ts";
// Prepare one remaining scene per idle callback, after the first painted frame.
export function createPreparation(prepare: (name: SceneName) => void) {
  let pending: number | null = null;
  const schedule = window.requestIdleCallback
    ? (fn: () => void) => window.requestIdleCallback(fn, { timeout: 2000 })
    : (fn: () => void) => setTimeout(fn, 150);
  const cancel = window.cancelIdleCallback
    ? (id: number) => window.cancelIdleCallback(id)
    : clearTimeout;
  function stop() {
    if (pending !== null) cancel(pending);
    pending = null;
  }
  function start(names: SceneName[]) {
    stop();
    const queue = [...names];
    function next() {
      pending = null;
      if (document.hidden) return;
      const name = queue.shift();
      if (name) prepare(name);
      if (queue.length) pending = schedule(next);
    }
    if (queue.length) pending = schedule(next);
  }
  return { start, stop };
}
