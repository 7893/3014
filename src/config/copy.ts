import type { SceneName } from "../scenes/types.ts";
// All website copy lives here. Vite renders this configuration into the HTML template.
export const copy = {
  site: {
    title: "随舟 · 3014",
    description: "一舟行过山海与灯火。",
    label: "随舟，一舟行过山海与灯火",
    signature: "三零一四",
    navigation: "选择场景",
    noScript: "此卷由程序绘就，请启用 JavaScript 展卷。",
  },
  hidden: { enter: "随光入室", back: "归舟" },
  scenes: {
    room: { label: "灯暖", title: "灯下相依", poem: ["月色入帘轻", "灯前两相依"],
      seal: ["相", "依"], mark: "此刻无声",
      description: "一室灯暖，木柜藏书，案上温茶。窗外星光明灭，薄云掠月入帘，两人静静相依。" },
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
        "海南意境的海湾，椰影摇曳，阳光洒落青绿浅海，细浪涌向沙岸，一人躺椅上晒太阳，两个孩子沿沙滩追逐，栈道尽头一位女孩背身坐着望海，一舟随波前行。",
    },
    garden: {
      label: "庭语",
      title: "一庭清梦",
      poem: ["风轻花入水", "与君共此舟"],
      seal: ["同", "游"],
      mark: "一舟两人",
      description: "江南大宅临水，粉墙黛瓦与低檐水榭围合深院，曲廊连着石拱桥，月洞门后小径回转，近景大幅荷叶与盛放荷花映水。一人划桨，一位女士坐在敞口小舟中，同游幽静庭院。",
    },
  },
  arrival: "{label}，{title}。",
};

export function arrivalText(scene: SceneName) {
  return copy.arrival.replace(
    /\{(label|title)\}/g,
    (_: string, key: "label" | "title") => copy.scenes[scene][key],
  );
}
