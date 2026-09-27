import { createPasses } from "./passes.js";
import { updateFish } from "./fish.js";
import { uploadTextures } from "./textures.js";
import { layerNames } from "../scene.js";
import { FISH_COUNT } from "../motion/fish.js";
import { createDevice } from "./device.js";
import { cityLayerNames } from "../city/painting.js";

export function createRenderer(canvas) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const fishData = new Float32Array(FISH_COUNT * 4),
    rippleData = new Float32Array(FISH_COUNT * 4);
  let passes = {},
    textures = {},
    targets = [],
    framebuffers = [],
    buffer,
    vao,
    scene;
  const { program, texture } = createDevice(gl);
  const names = {
    ink: layerNames.map((n) => (n === "boat" ? "boatLayer" : n)),
    city: cityLayerNames,
    coast: ["foreground", "trunk0", "leaves0", "trunk1", "leaves1"],
  };
  function initialize() {
    passes = {};
    textures = {};
    targets = [];
    framebuffers = [];
    buffer = vao = null;
    passes = createPasses(gl, program, names);
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
    for (const key of Object.keys(names))
      textures[key] = names[key].map(() => texture());
    for (let i = 0; i < 2; i++) {
      targets.push(texture());
      framebuffers.push(gl.createFramebuffer());
    }
    canvas.dataset.renderer = "webgl2";
  }
  function upload(next) {
    scene = next;
    uploadTextures(gl, canvas, scene, names, textures, targets, framebuffers);
  }
  function drawScene(key, slot, time, touch, x, wind) {
    const pass = passes[key],
      u = pass.uniforms;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[slot]);
    gl.useProgram(pass.program);
    names[key].forEach((name, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, textures[key][i]);
      gl.uniform1i(u[name], i);
    });
    if (key !== "ink") {
      const unit = names[key].length;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, textures.ink[layerNames.indexOf("boat")]);
      gl.uniform1i(u.boatLayer, unit);
    }
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
      H = (W * canvas.height) / canvas.width,
      scale = scene.portrait ? 1.35 : 1.6;
    gl.uniform2f(u.actorScale, scale / W, scale / H);
    if (key === "ink") {
      updateFish(canvas, time, fishData, rippleData);
      gl.uniform4fv(u["fish[0]"], fishData);
      gl.uniform4fv(u["fishRipples[0]"], rippleData);
      gl.uniform1f(u.boatOpacity, 1);
    }
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
    const pass = passes.final,
      u = pass.uniforms;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(pass.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, targets[0]);
    gl.uniform1i(u.source, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, targets[journey.transitioning ? 1 : 0]);
    gl.uniform1i(u.destination, 1);
    gl.uniform2f(u.size, canvas.width, canvas.height);
    gl.uniform1f(u.time, time);
    gl.uniform1f(u.blend, journey.blend);
    gl.uniform1i(u.sourceInk, journey.from === "ink" ? 1 : 0);
    gl.uniform1i(u.destinationInk, journey.to === "ink" ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function dispose() {
    Object.values(textures)
      .flat()
      .forEach((t) => gl.deleteTexture(t));
    targets.forEach((t) => gl.deleteTexture(t));
    framebuffers.forEach((f) => gl.deleteFramebuffer(f));
    Object.values(passes).forEach((p) => gl.deleteProgram(p.program));
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
    restore: initialize,
    dispose,
    maxSize: Math.min(
      gl.getParameter(gl.MAX_TEXTURE_SIZE),
      gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    ),
  };
}
