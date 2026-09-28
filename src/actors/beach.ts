import { actorSurface } from "./surface.ts";
import { createPierVisitor } from "./pier.ts";
import { createRunningChild } from "./child.ts";
import { Container } from "pixi.js";
import type { WebGLRenderer } from "pixi.js";

// Children and the seated visitor share one small atlas and one application clock.
export function createBeachActors() {
  const root = new Container(), children = [createRunningChild(0), createRunningChild(1)];
  const visitor = createPierVisitor();
  root.addChild(...children.map(child => child.root), visitor.root);
  const surface = actorSurface(root, 192, 64, 2);
  return {
    texture: surface.texture, feet: visitor.feet,
    draw(renderer: WebGLRenderer, time: number, width: number, height: number) {
      children.forEach(child => child.update(time));
      visitor.update(time, width, height);
      surface.draw(renderer);
    },
    dispose() {
      children.forEach(child => child.dispose()); visitor.dispose(); surface.dispose();
    },
  };
}
