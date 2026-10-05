/**
 * Geographic references live in config/places; composition lives beside each scene.
 * Environment state owns smooth render conditions, never fetching inside a frame.
 * Scene contract: create(width, height) returns { layers, width, height }.
 * Layer keys match shader sampler names; array ordering is never an API.
 * drawStatic(ctx, painting, boat) supplies the Canvas 2D fallback.
 * Optional uniforms() and update() encapsulate scene-specific motion.
 */
import type { UniformData } from "pixi.js";
import { createCity } from "./city/painting.ts";
import { fragment as city } from "./city/shaders/main.ts";
import { drawStaticCity } from "./city/static.ts";
import { createCoast } from "./coast/painting.ts";
import { fragment as coast } from "./coast/shaders/main.ts";
import { drawStaticCoast } from "./coast/static.ts";
import { createGarden } from "./garden/painting.ts";
import { fragment as garden } from "./garden/shaders/main.ts";
import { drawStaticGarden } from "./garden/static.ts";
import { createInk } from "./ink/painting.ts";
import { fragment as ink } from "./ink/shaders/main.ts";
import { drawStaticInk } from "./ink/static.ts";
import { fishUniforms, updateFishUniforms } from "./ink/uniforms.ts";
import { createRoom } from "./room/painting.ts";
import { fragment as room } from "./room/shaders/main.ts";
import { drawStaticRoom } from "./room/static.ts";
import { roomUniforms, updateRoom } from "./room/uniforms.ts";
import type { Painting, SceneName } from "./types.ts";

interface Definition {
	create: (width: number, height: number) => Painting;
	drawStatic: (
		ctx: CanvasRenderingContext2D,
		painting: Painting,
		boat: HTMLCanvasElement,
	) => void;
	fragment: string;
	nearest?: string[];
	uniforms?: () => Record<string, UniformData>;
	update?: (
		uniforms: Record<string, unknown>,
		canvas: HTMLCanvasElement,
		time: number,
	) => void;
}
export const definitions: Record<SceneName, Definition> = {
	room: {
		create: createRoom,
		drawStatic: drawStaticRoom,
		fragment: room,
		uniforms: roomUniforms,
		update: updateRoom,
	},
	garden: {
		create: createGarden,
		drawStatic: drawStaticGarden,
		fragment: garden,
	},
	ink: {
		create: createInk,
		drawStatic: drawStaticInk,
		fragment: ink,
		uniforms: fishUniforms,
		update: updateFishUniforms,
	},
	city: {
		create: createCity,
		drawStatic: drawStaticCity,
		fragment: city,
		nearest: ["windows"],
	},
	coast: { create: createCoast, drawStatic: drawStaticCoast, fragment: coast },
};
