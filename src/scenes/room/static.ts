import type { Painting } from "../types.ts";
export function drawStaticRoom(ctx: CanvasRenderingContext2D, room: Painting) {
  for (const name of ["interior", "figures", "curtain"])
    ctx.drawImage(room.layers[name], 0, 0);
}
export function roomUniforms() {
  return { u_candle: { value: [0, 0], type: "vec2<f32>" as const },
    u_couple: { value: [0, 0], type: "vec2<f32>" as const } };
}
export function updateRoom(uniforms: Record<string, unknown>, canvas: HTMLCanvasElement) {
  const W = canvas.width / canvas.height < .85 ? 760 : 1600, H = W * canvas.height / canvas.width;
  const candle = uniforms.u_candle as number[], couple = uniforms.u_couple as number[];
  candle[0] = .20; candle[1] = .74 - 18 / H;
  couple[0] = W === 760 ? .45 : .49; couple[1] = .80;
}
