import { RenderTexture } from "pixi.js";

export function createTargets() {
	let width = 1,
		height = 1;
	const textures = [0, 1].map(() =>
		RenderTexture.create({
			width: 1,
			height: 1,
			resolution: 1,
			antialias: false,
			scaleMode: "linear",
			autoGenerateMipmaps: false,
		}),
	);
	return {
		textures,
		resize(nextWidth: number, nextHeight: number) {
			width = nextWidth;
			height = nextHeight;
			textures.forEach((texture) => texture.resize(1, 1));
		},
		get(slot: number) {
			const texture = textures[slot];
			if (texture.width !== width || texture.height !== height)
				texture.resize(width, height);
			return texture;
		},
		dispose() {
			textures.forEach((texture) => texture.destroy(true));
		},
	};
}
