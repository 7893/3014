export type SceneName = "ink" | "city" | "coast";
export type Layers = Record<string, HTMLCanvasElement>;
export interface Painting {
  layers: Layers;
  width: number;
  height: number;
  portrait?: boolean;
}
export interface JourneyState {
  scene: SceneName;
  from: SceneName;
  to: SceneName;
  blend: number;
  transitioning: boolean;
  positions: Partial<Record<SceneName, number>>;
}
export type Scene = ReturnType<typeof import("./index.ts").createScene>;
