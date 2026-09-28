import { CanvasSource } from "pixi.js";
import type { UniformData, MeshGeometry, TextureSource } from "pixi.js";
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
export function createResources(geometry: MeshGeometry, boat: TextureSource, beach: TextureSource) {
  const passes = new Map<SceneName, Pass>();
  const textures = new Map<SceneName, CanvasSource[]>();
  let painting: Scene;
  function clear() {
    textures.forEach((sources) =>
      sources.forEach((source) => source.destroy()),
    );
    textures.clear();
  }
  function upload(next: Scene) {
    clear();
    painting = next;
  }
  function prepare(name: SceneName) {
    if (textures.has(name)) return passes.get(name)!;
    const definition = definitions[name];
    const sources: Record<string, TextureSource> = { u_boatLayer: boat };
    if (name === "coast") sources.u_beachCrew = beach;
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
            ...(name === "coast" ? { u_pierFeet: { value: new Float32Array(4), type: "vec4<f32>" as const } } : {}),
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
