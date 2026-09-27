// Prepare one remaining scene per idle callback, after the first painted frame.
export function createPreparation(prepare) {
  let pending = null;
  const schedule = window.requestIdleCallback
    ? (fn) => window.requestIdleCallback(fn, { timeout: 2000 })
    : (fn) => setTimeout(fn, 150);
  const cancel = window.cancelIdleCallback
    ? (id) => window.cancelIdleCallback(id)
    : clearTimeout;
  function stop() {
    if (pending !== null) cancel(pending);
    pending = null;
  }
  function start(names) {
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
