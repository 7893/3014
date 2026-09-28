import { RenderTexture } from "pixi.js";

export function createTargets() {
  const textures = [0, 1].map(() =>
    RenderTexture.create({
      width: 1,
      height: 1,
      resolution: 1,
      antialias: false,
      scaleMode: "linear",
      autoGenerateMipmaps: false,
    }),
  );
  return {
    textures,
    resize(width: number, height: number) {
      textures.forEach((texture) => texture.resize(width, height));
    },
    dispose() {
      textures.forEach((texture) => texture.destroy(true));
    },
  };
}
