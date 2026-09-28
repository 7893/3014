import { element } from "./dom.ts";
import type { SceneButton } from "./dom.ts";
import type { JourneyState } from "../scenes/types.ts";
import { copy } from "../config/copy.ts";

function setLines(element: HTMLElement, lines: string[]) {
  element.replaceChildren(
    ...lines.flatMap((line, i: number) =>
      i
        ? [document.createElement("br"), document.createTextNode(line)]
        : [document.createTextNode(line)],
    ),
  );
}

let shownScene = "";
let inscription: HTMLElement;
export function updateSceneUI(
  canvas: HTMLCanvasElement,
  state: JourneyState,
  sceneButtons: SceneButton[],
) {
  const transition = String(state.transitioning);
  if (canvas.dataset.transition !== transition)
    canvas.dataset.transition = transition;
  inscription ??= element(".inscription");
  const opacity = state.transitioning
    ? String(Math.abs(state.blend * 2 - 1))
    : "1";
  if (inscription.style.opacity !== opacity)
    inscription.style.opacity = opacity;
  if (shownScene === state.scene) return;
  canvas.dataset.scene = state.scene;
  shownScene = state.scene;
  document.body.dataset.view = state.scene;
  const info = copy.scenes[state.scene];
  element("h1").textContent = info.title;
  setLines(element(".inscription p"), info.poem);
  setLines(element(".seal"), info.seal);
  element(".work-mark").textContent = info.mark;
  canvas.setAttribute("aria-label", info.description);
  for (const button of sceneButtons)
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.scene === state.scene),
    );
}
