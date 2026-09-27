import { definitions } from "../scenes/registry.js";

const shared = [
  "size",
  "time",
  "touch",
  "wind",
  "boatCenter",
  "boat",
  "boatLayer",
  "actorScale",
];

export function createResources(gl, device) {
  const programs = new Map(),
    scenes = new Map();
  const boat = device.texture();
  let painting;
  function uploadTexture(texture, source, nearest = false) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const filter = nearest ? gl.NEAREST : gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }
  function clearScenes() {
    for (const resource of scenes.values())
      for (const texture of Object.values(resource.textures))
        gl.deleteTexture(texture);
    scenes.clear();
  }
  function upload(next) {
    clearScenes();
    painting = next;
    uploadTexture(boat, next.boat);
  }
  function prepare(name) {
    if (scenes.has(name)) return scenes.get(name);
    const definition = definitions[name],
      layers = painting.get(name).layers;
    const names = Object.keys(layers);
    if (!programs.has(name))
      programs.set(
        name,
        device.program(definition.fragment, [
          ...shared,
          ...names,
          ...(definition.uniforms || []),
        ]),
      );
    const resource = {
      ...programs.get(name),
      textures: {},
      update: definition.createUniforms?.(),
    };
    try {
      for (const key of names) {
        resource.textures[key] = device.texture();
        uploadTexture(
          resource.textures[key],
          layers[key],
          definition.nearest?.includes(key),
        );
      }
    } catch (error) {
      Object.values(resource.textures).forEach((t) => gl.deleteTexture(t));
      throw error;
    }
    resource.bindings = [
      ...Object.entries(resource.textures),
      ["boatLayer", boat],
    ];
    scenes.set(name, resource);
    return resource;
  }
  function bind(resource) {
    let unit = 0;
    for (const [name, texture] of resource.bindings) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(resource.uniforms[name], unit++);
    }
  }
  function dispose() {
    clearScenes();
    programs.forEach((pass) => gl.deleteProgram(pass.program));
    programs.clear();
    gl.deleteTexture(boat);
  }
  return {
    upload,
    prepare,
    bind,
    dispose,
    get preparedScenes() {
      return [...scenes.keys()];
    },
  };
}
