import { actorSurface } from "./surface.ts";
import { createRunningChild } from "./child.ts";
import { Container } from "pixi.js";
import type { WebGLRenderer } from "pixi.js";

// Both children share one small atlas and one application clock.
export function createBeachActors() {
  const root = new Container(), children = [createRunningChild(0), createRunningChild(1)];
  root.addChild(...children.map(child => child.root));
  const surface = actorSurface(root, 128, 64, 2);
  return {
    texture: surface.texture,
    draw(renderer: WebGLRenderer, time: number) {
      children.forEach(child => child.update(time));
      surface.draw(renderer);
    },
    dispose() {
      children.forEach(child => child.dispose()); surface.dispose();
    },
  };
}
