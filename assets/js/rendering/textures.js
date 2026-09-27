import { layerNames } from "../scene.js";
import { cityLayerNames } from "../city/painting.js";
export function uploadTextures(
  gl,
  canvas,
  scene,
  names,
  textures,
  targets,
  framebuffers,
) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const sources = {
    ink: layerNames.map((n) => scene.layers[n]),
    city: cityLayerNames.map((n) => scene.city.layers[n]),
    coast: [scene.coast.layer, ...scene.coast.palms, scene.coast.shore],
  };
  gl.activeTexture(gl.TEXTURE0);
  for (const key of Object.keys(names))
    sources[key].forEach((source, i) => {
      gl.bindTexture(gl.TEXTURE_2D, textures[key][i]);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source,
      );
    });
  targets.forEach((target, i) => {
    gl.bindTexture(gl.TEXTURE_2D, target);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      canvas.width,
      canvas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[i]);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      target,
      0,
    );
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      throw new Error("Scene framebuffer unavailable");
  });
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
