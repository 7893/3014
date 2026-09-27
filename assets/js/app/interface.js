export const descriptions = {
  ink: {
    title: "山静日长",
    poem: "一水含天远<br />千山入梦深",
    seal: "山<br />居",
    mark: "隐居山水　·　心自闲",
    description: "层山隐于云间，淡日映天，近岸松石，一舟浮于江上，游鱼点水。",
    arrival: "舟入山水，隐居。",
  },
  city: {
    title: "京华入夜",
    poem: "亮马浮灯影<br />一舟渡古今",
    seal: "京<br />华",
    mark: "都市灯火　·　亮马河畔",
    description: "北京亮马河入夜，沿岸树影、步道与桥灯映入水中，一舟向右驶去。",
    arrival: "舟入亮马河，都市。",
  },
  coast: {
    title: "椰风海韵",
    poem: "椰影摇晴日<br />一舟入海风",
    seal: "海<br />南",
    mark: "海岛度假　·　风暖潮轻",
    description:
      "海南意境的海湾，椰影摇曳，阳光洒落青绿浅海，细浪涌向沙岸，一舟随波前行。",
    arrival: "舟入海南海湾，度假。",
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
