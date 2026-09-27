// All website copy lives here. Run `node scripts/sync-copy.mjs` after editing.
export const copy = {
  site: {
    title: "随舟 · 7893",
    description: "一舟行过山海与灯火。",
    label: "随舟，一舟行过山海与灯火",
    signature: "七八九三",
    navigation: "选择场景",
    noScript: "此卷由程序绘就，请启用 JavaScript 展卷。",
  },
  scenes: {
    ink: {
      label: "山静",
      title: "山静日长",
      poem: ["云过千山静", "舟行一水长"],
      seal: ["山", "居"],
      mark: "闲看云起",
      description: "层山隐于云间，淡日映天，近岸松石，一舟浮于江上，游鱼点水。",
    },
    city: {
      label: "城光",
      title: "京华灯影",
      poem: ["两岸灯相照", "一舟入夜深"],
      seal: ["京", "华"],
      mark: "灯火可亲",
      description:
        "北京亮马河入夜，沿岸树影、步道与桥灯映入水中，一舟向右驶去。",
    },
    coast: {
      label: "海风",
      title: "海天日暖",
      poem: ["风来椰影动", "日暖海天宽"],
      seal: ["听", "潮"],
      mark: "且听潮声",
      description:
        "海南意境的海湾，椰影摇曳，阳光洒落青绿浅海，细浪涌向沙岸，一舟随波前行。",
    },
  },
  arrival: "{label}，{title}。",
};

export function arrivalText(scene) {
  return copy.arrival.replace(
    /\{(label|title)\}/g,
    (_, key) => copy.scenes[scene][key],
  );
}
