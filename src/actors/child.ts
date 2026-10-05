import {
	AABBRectangleBoundsProvider,
	AtlasAttachmentLoader,
	SkeletonJson,
	Spine,
	TextureAtlas,
} from "@esotericsoftware/spine-pixi-v8";
import { Container, Graphics } from "pixi.js";
import { BEACH_RUN } from "../config/actors.ts";
import { dressChild } from "./child-appearance.ts";
import motion from "./child-motion.json";

// Share immutable motion data; each child owns its skeleton and display objects.
const data = new SkeletonJson(
	new AtlasAttachmentLoader(new TextureAtlas("")),
).readSkeletonData(motion);
const size = 0.06,
	stride = 48;

export function createRunningChild(index: number) {
	const actor = new Spine({
		skeletonData: data,
		autoUpdate: false,
		boundsProvider: new AABBRectangleBoundsProvider(-250, -700, 600, 800),
	});
	actor.scale.set(size);
	dressChild(actor, index);
	const root = new Container();
	root.position.set(32 + index * 64, 57);
	const shadow = new Graphics()
		.ellipse(0, 1, 8, 1.2)
		.fill({ color: 0x736041, alpha: 0.2 });
	root.addChild(shadow, actor);
	actor.state.data.defaultMix = 0;
	const idle = actor.state.setAnimation(0, "idle", true);
	const run = actor.state.setAnimation(1, "run", true);
	return {
		root,
		actor,
		update(time: number, width = 960, height = 844) {
			const phase = time * BEACH_RUN.speed - index * BEACH_RUN.lag,
				heading = Math.cos(phase);
			const half = Math.floor((phase + Math.PI / 2) / Math.PI);
			const progress = phase + Math.PI / 2 - half * Math.PI;
			const distance = half * 2 + 1 - Math.cos(progress);
			const scale = Math.max(0.5, Math.min(width, height) / 850);
			const cycles = (distance * BEACH_RUN.range * width) / scale / stride;
			// Absolute, bounded clocks also support scene switches, seeking and long sessions.
			idle.trackTime =
				((time % idle.animation!.duration) + idle.animation!.duration) %
				idle.animation!.duration;
			run.trackTime = (((cycles % 1) + 1) % 1) * run.animation!.duration;
			const blend = Math.max(0, Math.min(1, (Math.abs(heading) - 0.12) / 0.4));
			run.alpha = blend * blend * (3 - 2 * blend);
			actor.scale.x = heading < 0 ? -size : size;
			actor.update(0);
		},
		// The shared actor surface destroys the display tree and its GPU resources.
		dispose() {
			actor.state.clearTracks();
		},
	};
}
