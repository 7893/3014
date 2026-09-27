import { layerNames } from "../scene.js";
import { FISH_COUNT, fishState } from "../motion/fish.js";
import { boatMotion } from "../motion/boat.js";
import { vertex } from "./shaders/common.js";
import { fragment as sceneFragment } from "./shaders/scene.js";
import { fragment as cityFragment } from "./shaders/city.js";
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
  const fishData = new Float32Array(FISH_COUNT * 4);
  const rippleData = new Float32Array(FISH_COUNT * 4);
  let passes = [],
    textures = [],
    target,
    framebuffer,
    cityTextures = [],
    cityTarget,
    cityFramebuffer,
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
  function initialize() {
    // Reset stale handles after context restoration; the driver has already released them.
    passes = [];
    textures = [];
    target = framebuffer = buffer = vao = cityTarget = cityFramebuffer = null;
    cityTextures = [];
    passes.push(
      program(sceneFragment, [
        "size",
        "time",
        "touch",
        "fish[0]",
        "fishRipples[0]",
        "boatCenter",
        "boatOpacity",
        "boat",
        "paper",
        "far",
        "middle",
        "near",
        "shore",
        "pines",
        "boatLayer",
      ]),
    );
    passes.push(
      program(cityFragment, [
        "size",
        "time",
        "touch",
        "boatCenter",
        "boat",
        "actorScale",
        "buildings",
        "lights",
        "bank",
        "boatLayer",
      ]),
    );
    passes.push(
      program(transitionFragment, ["size", "time", "blend", "ink", "city"]),
    );
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
    for (const name of layerNames) textures.push(texture());
    cityTextures = cityLayerNames.map(() => texture());
    cityTarget = texture();
    cityFramebuffer = gl.createFramebuffer();
    target = texture();
    framebuffer = gl.createFramebuffer();
    canvas.dataset.renderer = "webgl2";
  }
  function upload(next) {
    scene = next;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    for (let i = 0; i < layerNames.length; i++) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, textures[i]);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        scene.layers[layerNames[i]],
      );
    }
    gl.activeTexture(gl.TEXTURE0);
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
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      target,
      0,
    );
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      throw new Error("Ink framebuffer unavailable");
    for (let i = 0; i < cityLayerNames.length; i++) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, cityTextures[i]);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        scene.city.layers[cityLayerNames[i]],
      );
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cityTarget);
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
    gl.bindFramebuffer(gl.FRAMEBUFFER, cityFramebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      cityTarget,
      0,
    );
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      throw new Error("City framebuffer unavailable");
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  function draw(time, touch, journey = { blend: 0 }) {
    gl.bindVertexArray(vao);
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (journey.blend < 1) {
      const pass = passes[0],
        u = pass.uniforms;
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.useProgram(pass.program);
      for (let i = 0; i < layerNames.length; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, textures[i]);
        gl.uniform1i(
          u[layerNames[i] === "boat" ? "boatLayer" : layerNames[i]],
          i,
        );
      }
      gl.uniform2f(u.size, canvas.width, canvas.height);
      gl.uniform1f(u.time, time);
      gl.uniform3fv(u.touch, touch);
      const aspect = canvas.width / canvas.height;
      for (let i = 0; i < FISH_COUNT; i++) {
        fishData.set(fishState(time, i, aspect), i * 4);
        const period = 13 + i * 3;
        const age = (time + period - i * 3 - 2) % period;
        const born = time - age;
        const position = fishState(born, i, aspect);
        const opacity = age < 4 ? Math.sin((Math.PI * age) / 4) * 0.65 : 0;
        rippleData.set([position[0], position[1], age, opacity], i * 4);
      }
      gl.uniform4fv(u["fish[0]"], fishData);
      gl.uniform4fv(u["fishRipples[0]"], rippleData);
      const boat = boatMotion(time, scene.boatCenter);
      if (journey.inkX !== undefined) {
        boat.offset[0] = journey.inkX - scene.boatCenter[0];
        boat.opacity = 1;
      }
      gl.uniform2fv(u.boat, boat.offset);
      gl.uniform1f(u.boatOpacity, boat.opacity);
      gl.uniform2fv(u.boatCenter, scene.boatCenter);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (journey.blend > 0) {
      const pass = passes[1],
        u = pass.uniforms;
      gl.bindFramebuffer(gl.FRAMEBUFFER, cityFramebuffer);
      gl.useProgram(pass.program);
      cityLayerNames.forEach((name, i) => {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, cityTextures[i]);
        gl.uniform1i(u[name], i);
      });
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, textures[layerNames.indexOf("boat")]);
      gl.uniform1i(u.boatLayer, 3);
      gl.uniform2f(u.size, canvas.width, canvas.height);
      gl.uniform1f(u.time, time);
      gl.uniform3fv(u.touch, touch);
      gl.uniform2fv(u.boatCenter, scene.boatCenter);
      gl.uniform2fv(u.boat, [
        (journey.cityX ?? 0.5) - scene.boatCenter[0],
        Math.sin(time * 1.05) * 0.0022,
      ]);
      const W = scene.portrait ? 760 : 1600,
        H = (W * canvas.height) / canvas.width,
        scale = scene.portrait ? 1.35 : 1.6;
      gl.uniform2f(u.actorScale, scale / W, scale / H);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    const final = passes[2];
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(final.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, target);
    gl.uniform1i(final.uniforms.ink, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, cityTarget);
    gl.uniform1i(final.uniforms.city, 1);
    gl.uniform2f(final.uniforms.size, canvas.width, canvas.height);
    gl.uniform1f(final.uniforms.time, time);
    gl.uniform1f(final.uniforms.blend, journey.blend);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function dispose() {
    textures.forEach((t) => gl.deleteTexture(t));
    cityTextures.forEach((t) => gl.deleteTexture(t));
    gl.deleteTexture(cityTarget);
    gl.deleteFramebuffer(cityFramebuffer);
    passes.forEach((p) => gl.deleteProgram(p.program));
    gl.deleteTexture(target);
    gl.deleteFramebuffer(framebuffer);
    gl.deleteBuffer(buffer);
    gl.deleteVertexArray(vao);
  }
  try {
    initialize();
  } catch (error) {
    dispose();
    console.warn("Using static ink layers.", error);
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
