import { createTimeline } from "animejs";

// One leg: contact, compression, passing, push-off, lift and recovery.
// During stance the foot moves back 24 units per cycle, matching ground travel.
const keys = [
  [-13, 4, -7, 6, 0], [-12, 1, -6, 3, 0],
  [-13, -1, -6, 0, 0], [-14, -3, -7, -3, 0],
  [-15, -4, -9, -6, -1], [-14, -1, -10, -7, -6],
  [-13, 4, -9, -2, -9], [-12, 6, -7, 4, -5],
  [-13, 4, -7, 6, 0],
];
export const runCycle = { frames: 32, stride: 24 };
export function createRunPoses() {
  const pose = { hip: -13, kneeX: 4, kneeY: -7, footX: 6, footY: 0 };
  const motion = createTimeline({ autoplay: false });
  keys.slice(1).forEach(([hip, kneeX, kneeY, footX, footY]) => {
    motion.add(pose, { hip, kneeX, kneeY, footX, footY, duration: 125, ease: "linear" });
  });
  try {
    return Array.from({ length: runCycle.frames }, (_, i) => {
      motion.seek(i / runCycle.frames * 1000, true);
      return { ...pose };
    });
  } finally { motion.cancel(); }
}
export type RunPose = ReturnType<typeof createRunPoses>[number];
