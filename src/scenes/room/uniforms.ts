import { roomLayout } from "./composition.ts";
export function roomUniforms() {
  return { u_candle: { value: [0, 0], type: "vec2<f32>" as const },
    u_couple: { value: [0, 0], type: "vec2<f32>" as const },
    u_window: { value: [0, 0, 0, 0], type: "vec4<f32>" as const } };
}
// Reuse the painting's layout; compute only when viewport dimensions change.
const viewports = new WeakMap<object, number>();
export function updateRoom(uniforms: Record<string, unknown>, canvas: HTMLCanvasElement) {
  const key = canvas.width * 100000 + canvas.height;
  if (viewports.get(uniforms) === key) return;
  viewports.set(uniforms, key);
  const W = canvas.width / canvas.height < .85 ? 760 : 1600, H = W * canvas.height / canvas.width;
  const layout = roomLayout(W, H), win = layout.window;
  const candle = uniforms.u_candle as number[], couple = uniforms.u_couple as number[];
  candle[0] = layout.candle.x / W; candle[1] = (layout.candle.y - 18) / H;
  couple[0] = layout.couple.x / W; couple[1] = layout.couple.y / H;
  const window = uniforms.u_window as number[];
  window[0] = win.x / W; window[1] = win.y / H;
  window[2] = win.width / W; window[3] = win.height / H;
}
