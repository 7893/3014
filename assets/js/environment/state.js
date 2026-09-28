import { places } from "../config/places.js";

// Render conditions, independent of any weather provider or network lifecycle.
// wind: artistic multiplier [0,2]; cloud/haze: coverage [0,1].
// Rain and daylight will get their own rendering passes when weather is added.
export function createEnvironment() {
  const fields = ["wind", "cloud", "haze"];
  const states = new Map(
    Object.entries(places).map(([name, place]) => [
      name,
      {
        target: { ...place.environment },
        current: { ...place.environment },
        time: null,
        atmosphere: new Float32Array(3),
        wind: new Float32Array(4),
      },
    ]),
  );
  function setTarget(name, conditions = {}) {
    const state = states.get(name);
    if (!state) throw new Error(`Unknown environment: ${name}`);
    for (const field of fields) {
      const value = conditions[field];
      if (Number.isFinite(value))
        state.target[field] = Math.max(
          0,
          Math.min(field === "wind" ? 2 : 1, value),
        );
    }
  }
  function reset(name) {
    if (!places[name]) throw new Error(`Unknown environment: ${name}`);
    setTarget(name, places[name].environment);
  }
  function sample(name, time, wind) {
    const state = states.get(name);
    // Hidden scenes do not jump through a long interpolation on re-entry.
    const dt =
      state.time === null ? 0 : Math.max(0, Math.min(1, time - state.time));
    state.time = time;
    const blend = 1 - Math.exp(-dt / 8);
    for (let i = 0; i < fields.length; i++) {
      const key = fields[i];
      state.current[key] += (state.target[key] - state.current[key]) * blend;
      state.atmosphere[i] = state.current[key];
    }
    const strength = 0.25 + 0.75 * state.current.wind;
    // Preserve integrated cloud drift: scaling absolute phase causes snapping.
    state.wind.set([
      wind[0] * strength,
      wind[1] * strength,
      wind[2],
      wind[3] * strength,
    ]);
    return state;
  }
  return { setTarget, reset, sample };
}
