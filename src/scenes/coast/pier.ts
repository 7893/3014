import { PerspectivePlaneGeometry } from "pixi.js";

// Clockwise corners: seaward back edge, shore back edge, shore front, seaward front.
const views = {
	landscape: [0.77, 0.782, 1.045, 0.858, 1.005, 0.893, 0.745, 0.803],
	portrait: [0.66, 0.802, 1.04, 0.851, 1.005, 0.877, 0.635, 0.815],
};
export function createPierGeometry(width: number, height: number) {
	const corners = views[width / height < 0.85 ? "portrait" : "landscape"];
	const geometry = new PerspectivePlaneGeometry({
		width: 800,
		height: 80,
		verticesX: 25,
		verticesY: 3,
	});
	geometry.setCorners(
		...(corners.map((v, i) => v * (i % 2 ? height : width)) as [
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number,
		]),
	);
	return geometry;
}
