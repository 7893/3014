import type { SceneName } from "../scenes/types.ts";

export const sceneOrder: SceneName[] = ["ink", "city", "coast", "garden"];
export const hiddenScenes = new Set<SceneName>(["garden", "room"]);
export const publicScenes = sceneOrder.filter(name => !hiddenScenes.has(name));
