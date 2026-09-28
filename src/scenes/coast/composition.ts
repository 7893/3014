export const palms = [
  { root: [0.035, 0.965], crown: [0.09, 0.495], phase: 0 },
  { root: [-0.025, 0.945], crown: [0.145, 0.605], phase: 0.8 },
];

export const landforms = {
  island: {
    left: 0.57,
    span: 0.22,
    base: 0.491,
    height: 0.058,
    profile: [
      [0, 0],
      [0.12, 0.18],
      [0.25, 0.62],
      [0.43, 0.9],
      [0.56, 1],
      [0.7, 0.71],
      [0.85, 0.35],
      [1, 0],
    ],
  },
  distant: {
    left: 0.83,
    span: 0.3,
    base: 0.481,
    height: 0.115,
    profile: [
      [0, 0],
      [0.2, 0.24],
      [0.36, 0.6],
      [0.52, 0.54],
      [0.72, 1],
      [1, 0.75],
    ],
  },
  headland: {
    left: 0.79,
    span: 0.26,
    base: 0.627,
    height: 0.115,
    shore: [
      [0, 0],
      [0.2, 0.005],
      [0.42, 0.01],
      [0.72, -0.002],
      [1, -0.006],
    ],
    profile: [
      [0, 0],
      [0.14, 0.13],
      [0.3, 0.32],
      [0.45, 0.4],
      [0.6, 0.68],
      [0.75, 0.81],
      [0.88, 1],
      [1, 0.93],
    ],
  },
};

// Canvas and shader deformation share exactly the same palm anchors.
const vec = ([x, y]: number[]) => `vec2(${x.toFixed(3)},${y.toFixed(3)})`;
export const palmAnchors = palms
  .map(
    ({ root, crown, phase }, i) =>
      `const vec2 palmRoot${i}=${vec(root)},palmCrown${i}=${vec(crown)};
   const float palmPhase${i}=${phase.toFixed(2)};`,
  )
  .join("\n");
