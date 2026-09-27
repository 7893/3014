import { createResources } from "./resources.js";
import { createTargets } from "./targets.js";
import { createCompositor } from "./compositor.js";
import { createDevice } from "./device.js";

export function createRenderer(canvas) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const device = createDevice(gl);
  let resources, targets, compositor, buffer, vao, scene;
  function initialize() {
    resources = targets = compositor = buffer = vao = null;
    resources = createResources(gl, device);
    targets = createTargets(gl, device);
    compositor = createCompositor(gl, device);
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    canvas.dataset.renderer = "webgl2";
  }
  function upload(next) {
    scene = next;
    resources.upload(next);
    targets.resize(canvas.width, canvas.height);
  }
  function drawScene(key, slot, time, touch, x, wind) {
    const pass = resources.prepare(key),
      u = pass.uniforms;
    gl.bindFramebuffer(gl.FRAMEBUFFER, targets.framebuffers[slot]);
    gl.useProgram(pass.program);
    resources.bind(pass);
    gl.uniform2f(u.size, canvas.width, canvas.height);
    gl.uniform1f(u.time, time);
    gl.uniform3fv(u.touch, touch);
    gl.uniform4fv(u.wind, wind);
    gl.uniform2fv(u.boatCenter, scene.boatCenter);
    gl.uniform2f(
      u.boat,
      x - scene.boatCenter[0],
      Math.sin(time * 1.05) * 0.0022,
    );
    const W = scene.portrait ? 760 : 1600,
      H = (W * canvas.height) / canvas.width;
    const scale = scene.portrait ? 1.35 : 1.6;
    gl.uniform2f(u.actorScale, scale / W, scale / H);
    pass.update?.(gl, u, canvas, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function draw(time, touch, journey, wind = [0, 0, time, 0.65]) {
    gl.bindVertexArray(vao);
    gl.viewport(0, 0, canvas.width, canvas.height);
    drawScene(
      journey.from,
      0,
      time,
      touch,
      journey.positions[journey.from],
      wind,
    );
    if (journey.transitioning)
      drawScene(
        journey.to,
        1,
        time,
        touch,
        journey.positions[journey.to],
        wind,
      );
    compositor.draw(canvas, targets.textures, time, journey);
  }
  function dispose() {
    resources?.dispose();
    targets?.dispose();
    compositor?.dispose();
    gl.deleteBuffer(buffer);
    gl.deleteVertexArray(vao);
  }
  try {
    initialize();
  } catch (error) {
    dispose();
    console.warn("Using static scenes.", error);
    return null;
  }
  return {
    upload,
    draw,
    dispose,
    restore: initialize,
    prepare: (name) => resources.prepare(name),
    get preparedScenes() {
      return resources.preparedScenes;
    },
    maxSize: Math.min(
      gl.getParameter(gl.MAX_TEXTURE_SIZE),
      gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    ),
  };
}
