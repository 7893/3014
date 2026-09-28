import { CanvasSource } from "pixi.js";
import type { UniformData, MeshGeometry } from "pixi.js";
import { definitions } from "../scenes/registry.ts";
import type { Scene, SceneName } from "../scenes/types.ts";
import { createPass } from "./pass.ts";
import type { Pass } from "./pass.ts";

function texture(canvas: HTMLCanvasElement, nearest = false) {
  return new CanvasSource({
    resource: canvas,
    alphaMode: "no-premultiply-alpha",
    scaleMode: nearest ? "nearest" : "linear",
    autoGenerateMipmaps: false,
  });
}
function shared(): Record<string, UniformData> {
  return {
    u_size: { value: [0, 0], type: "vec2<f32>" },
    u_time: { value: 0, type: "f32" },
    u_touch: { value: [0, 0, -100], type: "vec3<f32>" },
    u_wind: { value: [0, 0, 0, 0], type: "vec4<f32>" },
    u_environment: { value: [0, 0, 0], type: "vec3<f32>" },
    u_boatCenter: { value: [0, 0], type: "vec2<f32>" },
    u_boat: { value: [0, 0], type: "vec2<f32>" },
    u_actorScale: { value: [0, 0], type: "vec2<f32>" },
  };
}
export function createResources(geometry: MeshGeometry) {
  const passes = new Map<SceneName, Pass>();
  const textures = new Map<SceneName, CanvasSource[]>();
  let boat: CanvasSource | undefined, painting: Scene;
  function clear() {
    textures.forEach((sources) =>
      sources.forEach((source) => source.destroy()),
    );
    textures.clear();
    boat?.destroy();
  }
  function upload(next: Scene) {
    clear();
    painting = next;
    boat = texture(next.boat);
  }
  function prepare(name: SceneName) {
    if (textures.has(name)) return passes.get(name)!;
    const definition = definitions[name];
    const sources: Record<string, CanvasSource> = { u_boatLayer: boat! };
    const owned: CanvasSource[] = [];
    try {
      for (const [key, canvas] of Object.entries(painting.get(name).layers)) {
        const source = texture(canvas, definition.nearest?.includes(key));
        sources[`u_${key}`] = source;
        owned.push(source);
      }
      let pass = passes.get(name);
      if (!pass) {
        pass = createPass(
          definition.fragment,
          {
            ...shared(),
            ...definition.uniforms?.(),
          },
          sources,
          geometry,
        );
        passes.set(name, pass);
      } else {
        Object.assign(pass.shader.resources, sources);
      }
      textures.set(name, owned);
      return pass;
    } catch (error) {
      owned.forEach((source) => source.destroy());
      throw error;
    }
  }
  return {
    upload,
    prepare,
    dispose() {
      clear();
      passes.forEach((pass) => pass.dispose());
      passes.clear();
    },
    get preparedScenes() {
      return [...textures.keys()];
    },
  };
}
