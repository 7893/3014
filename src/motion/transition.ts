import { createTimeline, engine } from "animejs";

// The application clock owns time; Anime never schedules another frame loop.
engine.useDefaultMainLoop = false;
export const TRANSITION_SECONDS = 5;
export function createTransition(outgoingX: number, speed: number) {
  const values = { blend: 0, outgoing: outgoingX, incoming: 0.07 };
  const timeline = createTimeline({ autoplay: false }).add(
    values,
    {
      blend: { from: 0, to: 1, ease: (p: number) => p * p * (3 - 2 * p) },
      outgoing: outgoingX + TRANSITION_SECONDS * speed,
      incoming: 0.22,
      duration: TRANSITION_SECONDS * 1000,
      ease: "linear",
    },
    0,
  );
  return {
    values,
    seek(seconds: number) {
      timeline.seek(seconds * 1000, true);
    },
    dispose() {
      timeline.cancel();
    },
  };
}
