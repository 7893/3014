import type { SceneName } from "../scenes/types.ts";

export type SceneButton = HTMLButtonElement & { dataset: { scene: SceneName } };
export function element<T extends HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing interface element: ${selector}`);
  return node;
}
