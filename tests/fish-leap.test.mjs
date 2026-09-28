import assert from "node:assert/strict";
import test from "node:test";
import { fishState } from "../src/motion/fish.ts";
import { LEAP_DURATION, leapingFish } from "../src/motion/fish-leap.ts";

test("a leap joins the swimming path without position or heading jumps", () => {
  for (const aspect of [390 / 844, 1.44]) {
    for (let start = 2; start < 150; start += 13) {
      for (const age of [0, LEAP_DURATION, LEAP_DURATION + 0.001]) {
        const swimming = fishState(start + age, 0, aspect);
        const jumping = leapingFish(start + age, age, aspect);
        jumping.forEach((value, i) =>
          assert(Math.abs(value - swimming[i]) < 1e-8),
        );
      }
      const age = LEAP_DURATION / 2;
      const jumping = leapingFish(start + age, age, aspect);
      const swimming = fishState(start + age, 0, aspect);
      assert(jumping[1] < swimming[1] - 0.015, "fish must clear the surface");
      assert.equal(jumping[0], swimming[0], "forward travel must continue");
      for (let step = 0; step <= 60; step++) {
        const age = (LEAP_DURATION * step) / 60;
        assert(leapingFish(start + age, age, aspect).every(Number.isFinite));
      }
    }
  }
});
