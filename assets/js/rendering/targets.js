export function createTargets(gl, device) {
  const textures = [device.texture(), device.texture()];
  const framebuffers = [gl.createFramebuffer(), gl.createFramebuffer()];
  let width = 0,
    height = 0;
  function resize(w, h) {
    if (w === width && h === height) return;
    textures.forEach((texture, i) => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA8,
        w,
        h,
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
        texture,
        0,
      );
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
        throw new Error("Scene framebuffer unavailable");
    });
    width = w;
    height = h;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  return {
    textures,
    framebuffers,
    resize,
    dispose() {
      textures.forEach((t) => gl.deleteTexture(t));
      framebuffers.forEach((f) => gl.deleteFramebuffer(f));
    },
  };
}
