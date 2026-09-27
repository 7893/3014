import { fragment } from "./shaders/transition.js";
export function createCompositor(gl, device) {
  const pass = device.program(fragment, [
    "size",
    "time",
    "blend",
    "source",
    "destination",
    "sourceInk",
    "destinationInk",
  ]);
  return {
    draw(canvas, textures, time, journey) {
      const u = pass.uniforms;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.useProgram(pass.program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[0]);
      gl.uniform1i(u.source, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[journey.transitioning ? 1 : 0]);
      gl.uniform1i(u.destination, 1);
      gl.uniform2f(u.size, canvas.width, canvas.height);
      gl.uniform1f(u.time, time);
      gl.uniform1f(u.blend, journey.blend);
      gl.uniform1i(u.sourceInk, journey.from === "ink" ? 1 : 0);
      gl.uniform1i(u.destinationInk, journey.to === "ink" ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteProgram(pass.program);
    },
  };
}
