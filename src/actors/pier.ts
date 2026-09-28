import { AnimatedSprite, CanvasSource, Container, Rectangle, Texture } from "pixi.js";
import { PIER_VISITOR as pose } from "../config/actors.ts";
import { drawPierVisitor, visitorCycle, visitorPose } from "../drawing/pier-visitor.ts";
import { pier } from "../scenes/coast/pier.ts";

/** Prepainted poses use Pixi frame selection on the application's absolute clock. */
export function createPierVisitor() {
  const cell = { width: 32, height: 40, x: 18, y: 24 }, resolution = 3, columns = 8;
  const canvas = document.createElement("canvas");
  canvas.width = cell.width * columns * resolution;
  canvas.height = cell.height * Math.ceil(visitorCycle.frames / columns) * resolution;
  const c = canvas.getContext("2d")!; c.scale(resolution, resolution);
  const poses = Array.from({ length: visitorCycle.frames }, (_, frame) => visitorPose(frame));
  const source = new CanvasSource({ resource: canvas, resolution });
  const textures = poses.map((feet, frame) => {
    const x = frame % columns * cell.width, y = Math.floor(frame / columns) * cell.height;
    c.save(); c.translate(x + cell.x, y + cell.y); drawPierVisitor(c, feet); c.restore();
    return new Texture({ source, frame: new Rectangle(x, y, cell.width, cell.height) });
  });
  const sprite = new AnimatedSprite({ textures, autoUpdate: false });
  sprite.anchor.set(cell.x / cell.width, cell.y / cell.height);
  const root = new Container(); root.position.set(160, 24); root.addChild(sprite);
  const feet = new Float32Array(4);
  return {
    root, feet,
    update(time: number, width: number, height: number) {
      const frame = Math.floor((time % visitorCycle.seconds) / visitorCycle.seconds * textures.length);
      sprite.gotoAndStop(frame);
      const scale = Math.min(width, height) / pose.sizeDivisor, points = poses[sprite.currentFrame];
      for (let leg = 0; leg < 2; leg++) {
        feet[leg * 2] = pier.seatX + points[leg * 2] * scale / width;
        feet[leg * 2 + 1] = pier.seatY + points[leg * 2 + 1] * scale / height;
      }
    },
    dispose() {
      sprite.stop();
      textures.forEach(texture => texture.destroy()); source.destroy();
    },
  };
}
