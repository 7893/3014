import { layerNames } from "../scene.js";
import { FISH_COUNT, fishState } from "../motion/fish.js";
import { vertex } from "./shaders/common.js";
import { fragment as inkFragment } from "./shaders/scene.js";
import { fragment as cityFragment } from "./shaders/city.js";
import { fragment as coastFragment } from "./shaders/coast.js";
import { fragment as transitionFragment } from "./shaders/transition.js";
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
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(error);
    }
    return shader;
  }
  function program(fragment, keys) {
    const shaders = [];
    const p = gl.createProgram();
    try {
      shaders.push(compile(gl.VERTEX_SHADER, vertex));
      shaders.push(compile(gl.FRAGMENT_SHADER, fragment));
      shaders.forEach((s) => gl.attachShader(p, s));
      gl.bindAttribLocation(p, 0, "a_position");
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(p));
    } catch (error) {
      gl.deleteProgram(p);
      throw error;
    } finally {
      shaders.forEach((s) => gl.deleteShader(s));
    }
    return {
      program: p,
      uniforms: Object.fromEntries(
        keys.map((k) => [k, gl.getUniformLocation(p, "u_" + k)]),
      ),
    };
  }
  function texture() {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  const names = {
    ink: layerNames.map((n) => (n === "boat" ? "boatLayer" : n)),
    city: cityLayerNames,
    coast: ["foreground", "palms"],
  };
  function initialize() {
    passes = {};
    textures = {};
    targets = [];
    framebuffers = [];
    buffer = vao = null;
    const shared = [
      "size",
      "time",
      "touch",
      "boatCenter",
      "boat",
      "boatLayer",
      "actorScale",
    ];
    passes.ink = program(inkFragment, [
      ...shared,
      ...names.ink,
      "fish[0]",
      "fishRipples[0]",
      "boatOpacity",
    ]);
    passes.city = program(cityFragment, [...shared, ...names.city]);
    passes.coast = program(coastFragment, [...shared, ...names.coast]);
    passes.final = program(transitionFragment, [
      "size",
      "time",
      "blend",
      "source",
      "destination",
      "sourceInk",
      "destinationInk",
    ]);
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
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const sources = {
      ink: layerNames.map((n) => scene.layers[n]),
      city: cityLayerNames.map((n) => scene.city.layers[n]),
      coast: [scene.coast.layer, scene.coast.palms],
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
  function drawScene(key, slot, time, touch, x) {
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
      const aspect = canvas.width / canvas.height;
      for (let i = 0; i < FISH_COUNT; i++) {
        fishData.set(fishState(time, i, aspect), i * 4);
        const period = 13 + i * 3,
          age = (time + period - i * 3 - 2) % period,
          position = fishState(time - age, i, aspect);
        rippleData.set(
          [
            position[0],
            position[1],
            age,
            age < 4 ? Math.sin((Math.PI * age) / 4) * 0.65 : 0,
          ],
          i * 4,
        );
      }
      gl.uniform4fv(u["fish[0]"], fishData);
      gl.uniform4fv(u["fishRipples[0]"], rippleData);
      gl.uniform1f(u.boatOpacity, 1);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function draw(time, touch, journey) {
    gl.bindVertexArray(vao);
    gl.viewport(0, 0, canvas.width, canvas.height);
    drawScene(journey.from, 0, time, touch, journey.positions[journey.from]);
    if (journey.transitioning)
      drawScene(journey.to, 1, time, touch, journey.positions[journey.to]);
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
