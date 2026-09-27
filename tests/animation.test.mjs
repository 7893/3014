import test from "node:test";
import assert from "node:assert/strict";
import { createCadence, createAnimation } from "../assets/js/app/animation.js";
import { createWind } from "../assets/js/motion/wind.js";
import { createJourney } from "../assets/js/motion/journey.js";

test("cadence backs off under sustained pressure and recovers without oscillation", () => {
  const c = createCadence();
  for (let i = 0; i < 300; i++) c.sample(1000 / 60, 3);
  assert.equal(c.fps, 60);
  for (let i = 0; i < 120; i++) c.sample(1000 / 30, 17);
  assert.equal(c.fps, 30);
  for (let i = 0; i < 120; i++) c.sample(1000 / 60, 3);
  assert.equal(c.fps, 30);
  for (let i = 0; i < 700; i++) c.sample(1000 / 60, 3);
  assert.equal(c.fps, 60);
});

test("render throttling never throttles journey time; resuming excludes hidden time", () => {
  const originalRAF = globalThis.requestAnimationFrame,
    originalCancel = globalThis.cancelAnimationFrame;
  let pending,
    elapsed = 0,
    draws = 0,
    rate = 60;
  globalThis.requestAnimationFrame = (fn) => ((pending = fn), 1);
  globalThis.cancelAnimationFrame = () => {
    pending = null;
  };
  try {
    const loop = createAnimation({
      active: () => true,
      advance: (dt) => (elapsed += dt),
      draw: () => draws++,
      onRate: (fps) => (rate = fps),
    });
    loop.sync();
    for (let i = 0; i <= 600; i++) {
      const cb = pending;
      pending = null;
      cb((i * 1000) / 60);
    }
    assert(Math.abs(elapsed - 10) < 1e-8);
    assert(draws >= 595 && draws <= 601);
    loop.stop();
    assert.equal(pending, null);
    loop.sync();
    pending(60000);
    assert(Math.abs(elapsed - 10) < 1e-8);
    for (let i = 1; i <= 120; i++) pending(60000 + (i * 1000) / 30);
    assert.equal(rate, 30);
    const beforeTime = elapsed,
      beforeDraws = draws;
    for (let i = 1; i <= 120; i++) pending(64000 + (i * 1000) / 60);
    assert(Math.abs(elapsed - beforeTime - 2) < 1e-8);
    assert(draws - beforeDraws >= 58 && draws - beforeDraws <= 62);
    loop.stop();
  } finally {
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCancel;
  }
});

test("wind inertia stays stable and nearly identical at 30 and 60 fps", () => {
  const a = createWind(),
    b = createWind();
  let largestJump = 0,
    previous = 0;
  for (let i = 0; i < 3600; i++) {
    a.advance(1 / 60);
    largestJump = Math.max(largestJump, Math.abs(a.value[0] - previous));
    previous = a.value[0];
    assert(a.value.every(Number.isFinite));
    assert(Math.abs(a.value[0]) < 1.5);
  }
  for (let i = 0; i < 1800; i++) b.advance(1 / 30);
  for (let i = 0; i < 4; i++) assert(Math.abs(a.value[i] - b.value[i]) < 1e-4);
  assert(largestJump < 0.03);
  assert(a.value[2] > 30);
});

test("random scene rounds remain balanced without consecutive repeats", () => {
  const starts = new Set();
  for (let seed = 1; seed <= 30; seed++) {
    let n = Math.imul(seed, 2654435761) >>> 0;
    const random = () =>
      (n = (Math.imul(n, 1664525) + 1013904223) >>> 0) / 4294967296;
    const j = createJourney(0.69, random),
      arrivals = [j.state().scene];
    starts.add(j.state().scene);
    let moving = false;
    for (let i = 0; i < 6000; i++) {
      j.advance(0.1);
      const s = j.state();
      if (moving && !s.transitioning) arrivals.push(s.scene);
      moving = s.transitioning;
    }
    for (let i = 1; i < arrivals.length; i++)
      assert.notEqual(arrivals[i], arrivals[i - 1]);
    for (let i = 0; i + 3 <= arrivals.length; i += 3)
      assert.equal(new Set(arrivals.slice(i, i + 3)).size, 3);
  }
  assert.equal(starts.size, 3);
});
