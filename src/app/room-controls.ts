import { arrivalText } from "../config/copy.ts";
import { hiddenScenes } from "../config/scenes.ts";
import type { JourneyState, SceneName } from "../scenes/types.ts";
import { element } from "./dom.ts";

export function createRoomControls(select: (scene: SceneName) => void) {
	const entrance = element<HTMLButtonElement>("#sun-entry");
	const back = element<HTMLButtonElement>("#room-return");
	const enabled = !hiddenScenes.has("room");
	const abort = new AbortController(),
		options = { signal: abort.signal };
	let current: SceneName = "ink",
		previous: SceneName = "ink";
	let transitioning = false,
		lastWidth = 0,
		lastHeight = 0,
		restoreFocus = false;
	const choose = (name: SceneName) => {
		select(name);
		element("#status").textContent = arrivalText(name);
	};
	entrance.addEventListener(
		"click",
		() => {
			if (
				!enabled ||
				transitioning ||
				(current !== "ink" && current !== "coast")
			)
				return;
			previous = current;
			choose("room");
		},
		options,
	);
	function leave() {
		if (current === "room") {
			restoreFocus = true;
			choose(previous);
		}
	}
	back.addEventListener("click", leave, options);
	window.addEventListener(
		"keydown",
		(event) => {
			if (event.key === "Escape" && current === "room") {
				event.preventDefault();
				leave();
			}
		},
		options,
	);
	return {
		update(state: JourneyState) {
			if (
				current === state.scene &&
				transitioning === state.transitioning &&
				lastWidth === innerWidth &&
				lastHeight === innerHeight
			)
				return;
			const changed = current !== state.scene;
			current = state.scene;
			transitioning = state.transitioning;
			lastWidth = innerWidth;
			lastHeight = innerHeight;
			entrance.hidden =
				!enabled || transitioning || (current !== "ink" && current !== "coast");
			back.hidden = current !== "room";
			if (!entrance.hidden) {
				const portrait = innerWidth / innerHeight < 0.85;
				const x = current === "coast" || portrait ? 0.32 : 0.72;
				const y = current === "coast" ? 0.28 : portrait ? 0.12 : 0.205;
				const radius =
					current === "coast"
						? innerHeight * 0.036
						: Math.min(innerWidth, innerHeight) * 0.039;
				const size = Math.max(30, radius * 2);
				Object.assign(entrance.style, {
					left: `${x * innerWidth - size / 2}px`,
					top: `${y * innerHeight - size / 2}px`,
					width: `${size}px`,
					height: `${size}px`,
				});
			}
			if (changed && current === "room") back.focus({ preventScroll: true });
			else if (restoreFocus && !entrance.hidden) {
				entrance.focus({ preventScroll: true });
				restoreFocus = false;
			}
		},
		dispose: () => abort.abort(),
	};
}
