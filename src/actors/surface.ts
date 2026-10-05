import type { Container, WebGLRenderer } from "pixi.js";
import { RenderTexture } from "pixi.js";

/** Shared ownership for small Pixi actor atlases; never allocate per frame. */
export function actorSurface(
	root: Container,
	width: number,
	height: number,
	resolution: number,
) {
	const texture = RenderTexture.create({
		width,
		height,
		resolution,
		antialias: false,
	});
	return {
		texture,
		draw(renderer: WebGLRenderer) {
			renderer.render({
				container: root,
				target: texture,
				clear: true,
				clearColor: [0, 0, 0, 0],
			});
		},
		dispose() {
			root.destroy({ children: true });
			texture.destroy(true);
		},
	};
}
