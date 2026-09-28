const surfaces = {
  ink: { top: 0.745, bottom: 0.96, solids: ["near", "shore", "foliage"] },
  city: { top: 0.65, bottom: 1, solids: ["bank"] },
  coast: {
    top: 0.49,
    bottom: 1,
    solids: ["foreground", "trunk0", "leaves0", "trunk1", "leaves1"],
  },
};

export function hitWater(painting, name, x, y) {
  const surface = surfaces[name];
  if (!surface || x < 0 || x >= 1 || y <= surface.top || y >= surface.bottom)
    return false;
  const { layers } = painting.get(name);
  return surface.solids.every((key) => {
    const layer = layers[key];
    const pixel = layer
      .getContext("2d")
      .getImageData(
        Math.floor(x * layer.width),
        Math.floor(y * layer.height),
        1,
        1,
      ).data;
    return pixel[3] < 32;
  });
}
