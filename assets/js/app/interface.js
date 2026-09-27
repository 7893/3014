export const descriptions = {
  ink: {
    title: "山静日长",
    poem: "云过千山静<br />舟行一水长",
    seal: "山<br />居",
    mark: "闲看云起",
    description: "层山隐于云间，淡日映天，近岸松石，一舟浮于江上，游鱼点水。",
    arrival: "山静，山静日长。",
  },
  city: {
    title: "京华灯影",
    poem: "两岸灯相照<br />一舟入夜深",
    seal: "京<br />华",
    mark: "灯火可亲",
    description: "北京亮马河入夜，沿岸树影、步道与桥灯映入水中，一舟向右驶去。",
    arrival: "城光，京华灯影。",
  },
  coast: {
    title: "海天日暖",
    poem: "风来椰影动<br />日暖海天宽",
    seal: "听<br />潮",
    mark: "且听潮声",
    description:
      "海南意境的海湾，椰影摇曳，阳光洒落青绿浅海，细浪涌向沙岸，一舟随波前行。",
    arrival: "海风，海天日暖。",
  },
};

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
  const info = descriptions[state.scene];
  document.querySelector("h1").textContent = info.title;
  document.querySelector(".inscription p").innerHTML = info.poem;
  document.querySelector(".seal").innerHTML = info.seal;
  document.querySelector(".work-mark").textContent = info.mark;
  canvas.setAttribute("aria-label", info.description);
  for (const button of sceneButtons)
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.scene === state.scene),
    );
}
