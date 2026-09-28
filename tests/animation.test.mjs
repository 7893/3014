import test from "node:test";
import assert from "node:assert/strict";
import { createCadence, createAnimation } from "../src/app/animation.ts";
import { createWind } from "../src/motion/wind.ts";
import { createJourney, scenes } from "../src/motion/journey.ts";

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

test("render throttling never throttles journey time; resuming excludes hidden time", (t) => {
  const originalRAF = globalThis.requestAnimationFrame,
    originalCancel = globalThis.cancelAnimationFrame;
  let now = 0;
  t.mock.method(performance, "now", () => now);
  let pending,
    elapsed = 0,
    draws = 0,
    rate = 60;
  globalThis.requestAnimationFrame = (fn) => {
    pending = (stamp) => {
      now = stamp;
      fn(stamp);
    };
    return 1;
  };
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
    assert(draws >= 590 && draws <= 601, `Observed ${draws} draws`);
    loop.stop();
    assert.equal(pending, null);
    now = 60000;
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
    for (let i = 0; i + scenes.length <= arrivals.length; i += scenes.length)
      assert.equal(new Set(arrivals.slice(i, i + scenes.length)).size, scenes.length);
  }
  assert.equal(starts.size, scenes.length);
});

test("authored transitions preserve easing and can be interrupted", () => {
  const journey = createJourney(0.69, () => 0.9);
  journey.select("city");
  journey.advance(2.5);
  let state = journey.state();
  assert.equal(state.transitioning, true);
  assert.equal(state.blend, 0.5);
  assert(Math.abs(state.positions.ink - 0.725) < 0.000001);
  assert(Math.abs(state.positions.city - 0.145) < 0.000001);
  journey.select("coast");
  journey.advance(5);
  state = journey.state();
  assert.equal(state.scene, "coast");
  assert.equal(state.transitioning, false);
  assert.equal(state.positions.coast, 0.22);
});
