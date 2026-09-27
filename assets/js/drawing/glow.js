// Bake broad light falloff once; animate its intensity in the fragment shader.
export function createGlow(source) {
  const small = document.createElement("canvas");
  small.width = Math.max(1, Math.ceil(source.width / 4));
  small.height = Math.max(1, Math.ceil(source.height / 4));
  const scratch = document.createElement("canvas");
  scratch.width = small.width;
  scratch.height = small.height;
  scratch.getContext("2d").drawImage(source, 0, 0, small.width, small.height);
  const ctx = small.getContext("2d");
  for (const [radius, alpha] of [
    [1.2, 0.7],
    [4, 0.5],
    [9, 0.25],
  ]) {
    ctx.filter = `blur(${radius}px)`;
    ctx.globalAlpha = alpha;
    ctx.drawImage(scratch, 0, 0);
  }
  return small;
}
