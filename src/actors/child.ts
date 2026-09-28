import { AnimatedSprite, CanvasSource, Container, Rectangle, Texture } from "pixi.js";
import { BEACH_RUN } from "../config/actors.ts";
import { createRunPoses, runCycle } from "../motion/run-cycle.ts";
import { drawRunningChild } from "../drawing/running-child.ts";

/** Author once, play with Pixi; no live per-joint animation or limb sorting. */
export function createRunningChild(index: number) {
  const poses = createRunPoses(), columns = 8, resolution = 3;
  const canvas = document.createElement("canvas");
  canvas.width = columns * 32 * resolution; canvas.height = 5 * 40 * resolution;
  const c = canvas.getContext("2d")!; c.scale(resolution, resolution);
  const rest = { hip: -13, kneeX: 1, kneeY: -7, footX: 1, footY: 0 };
  for (let i = 0; i <= runCycle.frames; i++) {
    c.save(); c.translate(i % columns * 32 + 16, Math.floor(i / columns) * 40 + 32);
    drawRunningChild(c, poses[i] ?? rest, i === runCycle.frames ? { ...rest, kneeX: -1, footX: -1 } : poses[(i + 16) % 32], index, i === runCycle.frames);
    c.restore();
  }
  const source = new CanvasSource({ resource: canvas, resolution });
  const textures = Array.from({ length: runCycle.frames + 1 }, (_, i) => new Texture({ source,
    frame: new Rectangle(i % columns * 32, Math.floor(i / columns) * 40, 32, 40) }));
  const sprite = new AnimatedSprite({ textures, autoUpdate: false });
  sprite.anchor.set(.5, .8);
  const root = new Container(); root.position.set(32 + index * 64, 57); root.addChild(sprite);
  return {
    root, sprite, poses,
    update(time: number, width = 960, height = 844) {
      const phase = time * BEACH_RUN.speed - index * BEACH_RUN.lag, heading = Math.cos(phase);
      const half = Math.floor((phase + Math.PI / 2) / Math.PI), progress = phase + Math.PI / 2 - half * Math.PI;
      const distance = half * 2 + 1 - Math.cos(progress);
      const scale = Math.max(.5, Math.min(width, height) / 850);
      const cycles = distance * BEACH_RUN.range * width / scale / runCycle.stride;
      const frame = Math.floor(((cycles % 1 + 1) % 1) * runCycle.frames);
      sprite.scale.x = heading < 0 ? -1 : 1;
      sprite.gotoAndStop(Math.abs(heading) < .12 ? runCycle.frames : frame);
    },
    dispose() {
      sprite.stop(); textures.forEach(texture => texture.destroy()); source.destroy();
    },
  };
}
