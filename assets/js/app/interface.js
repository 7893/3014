import { copy } from "../config/copy.js";

function setLines(element, lines) {
  element.replaceChildren(
    ...lines.flatMap((line, i) =>
      i
        ? [document.createElement("br"), document.createTextNode(line)]
        : [document.createTextNode(line)],
    ),
  );
}

export function initializeCopy(sceneButtons) {
  document.title = copy.site.title;
  document.querySelector('meta[name="description"]').content =
    copy.site.description;
  document.querySelector("main").setAttribute("aria-label", copy.site.label);
  document.querySelector(".signature").textContent = copy.site.signature;
  document
    .querySelector(".scene-nav")
    .setAttribute("aria-label", copy.site.navigation);
  for (const button of sceneButtons)
    button.textContent = copy.scenes[button.dataset.scene].label;
}

let shownScene = "";
export function updateSceneUI(canvas, state, sceneButtons) {
  const transition = String(state.transitioning);
  if (canvas.dataset.transition !== transition)
    canvas.dataset.transition = transition;
  const inscription = document.querySelector(".inscription");
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
  document.querySelector("h1").textContent = info.title;
  setLines(document.querySelector(".inscription p"), info.poem);
  setLines(document.querySelector(".seal"), info.seal);
  document.querySelector(".work-mark").textContent = info.mark;
  canvas.setAttribute("aria-label", info.description);
  for (const button of sceneButtons)
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.scene === state.scene),
    );
}
