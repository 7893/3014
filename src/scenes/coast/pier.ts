import { PerspectivePlaneGeometry } from "pixi.js";

// Clockwise corners: seaward back edge, shore back edge, shore front, seaward front.
const views = {
  landscape: [.77, .782, 1.045, .858, 1.005, .893, .745, .803],
  portrait: [.66, .802, 1.04, .851, 1.005, .877, .635, .815],
};
export function createPierGeometry(width: number, height: number) {
  const corners = views[width / height < .85 ? "portrait" : "landscape"];
  const geometry = new PerspectivePlaneGeometry({ width: 800, height: 80, verticesX: 25, verticesY: 3 });
  geometry.setCorners(...corners.map((v, i) => v * (i % 2 ? height : width)) as
    [number, number, number, number, number, number, number, number]);
  return geometry;
}
