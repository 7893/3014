import { vertex, fragment } from "./shaders.js";

export function createRenderer(canvas) {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  let program, buffer, texture, uniforms;
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
  function initialize() {
    const high =
      gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision >
      0;
    const shaders = [];
    try {
      shaders.push(compile(gl.VERTEX_SHADER, vertex));
      shaders.push(
        compile(
          gl.FRAGMENT_SHADER,
          fragment.replace(
            "precision highp float;",
            high ? "precision highp float;" : "precision mediump float;",
          ),
        ),
      );
      program = gl.createProgram();
      shaders.forEach((s) => gl.attachShader(program, s));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(program));
    } finally {
      shaders.forEach((s) => gl.deleteShader(s));
    }
    gl.useProgram(program);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    uniforms = Object.fromEntries(
      ["size", "time", "touch", "painting"].map((k) => [
        k,
        gl.getUniformLocation(program, "u_" + k),
      ]),
    );
    gl.uniform1i(uniforms.painting, 0);
    canvas.dataset.renderer = "webgl";
  }
  function upload(painting) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      painting,
    );
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  function draw(time, touch) {
    gl.useProgram(program);
    gl.uniform2f(uniforms.size, canvas.width, canvas.height);
    gl.uniform1f(uniforms.time, time);
    gl.uniform3fv(uniforms.touch, touch);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function dispose() {
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  }
  try {
    initialize();
  } catch (error) {
    dispose();
    console.warn("Using the ink canvas renderer.", error);
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
