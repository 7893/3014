// Representative landscape coordinates, not survey points or weather stations.
// A future provider adapter reads these; painting modules never call a service.
export const places = {
  room: { name: "Imagined moonlit room", latitude: 31.32, longitude: 120.63,
    timeZone: "Asia/Shanghai", environment: { wind: .2, cloud: .1, haze: .1 } },
  garden: {
    name: "Suzhou · Imagined waterside courtyard",
    latitude: 31.32,
    longitude: 120.63,
    timeZone: "Asia/Shanghai",
    environment: { wind: 0.5, cloud: 0.3, haze: 0.4 },
  },
  ink: {
    name: "Yangshuo · Xingping, Li River",
    latitude: 24.92,
    longitude: 110.53,
    timeZone: "Asia/Shanghai",
    environment: { wind: 0.85, cloud: 0.45, haze: 0.65 },
  },
  city: {
    name: "Beijing · Liangma River",
    latitude: 39.95,
    longitude: 116.47,
    timeZone: "Asia/Shanghai",
    environment: { wind: 0.65, cloud: 0.18, haze: 0.35 },
  },
  coast: {
    name: "Wanning · Shimei Bay",
    latitude: 18.66,
    longitude: 110.25,
    timeZone: "Asia/Shanghai",
    environment: { wind: 1, cloud: 0.38, haze: 0.3 },
  },
};
