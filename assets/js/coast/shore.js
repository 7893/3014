// Both the painting and the GPU use the same cubic shoreline geometry.
const curves = [
  [
    [0, 0.855],
    [0.14, 0.88],
    [0.17, 0.96],
    [0.53, 1],
  ],
  [
    [1, 0.855],
    [0.9, 0.86],
    [0.82, 0.92],
    [0.61, 1],
  ],
];
export function beachPath(W, H, side) {
  const [a, b, c, d] = curves[side],
    path = new Path2D();
  path.moveTo(a[0] * W, a[1] * H);
  path.bezierCurveTo(
    b[0] * W,
    b[1] * H,
    c[0] * W,
    c[1] * H,
    d[0] * W,
    d[1] * H,
  );
  path.lineTo(a[0] * W, H);
  path.closePath();
  return path;
}
const vectors = curves.map((curve) =>
  curve.map((p) => `vec2(${p.map((n) => n.toFixed(3)).join(",")})`),
);
export const shoreline = `
vec2 beachCurve(float t,vec2 a,vec2 b,vec2 c,vec2 d){
  float u=1.-t;return u*u*u*a+3.*u*u*t*b+3.*u*t*t*c+t*t*t*d;
}
float beachHeight(float x){
  bool left=x<.55;
  if(x>.53&&x<.61)return 1.2;
  vec2 a=left?${vectors[0][0]}:${vectors[1][0]};
  vec2 b=left?${vectors[0][1]}:${vectors[1][1]};
  vec2 c=left?${vectors[0][2]}:${vectors[1][2]};
  vec2 d=left?${vectors[0][3]}:${vectors[1][3]};
  float lo=0.,hi=1.;
  for(int i=0;i<10;i++){
    float t=(lo+hi)*.5;
    float xx=beachCurve(t,a,b,c,d).x;
    if(left?xx<x:xx>x)lo=t;else hi=t;
  }
  return beachCurve((lo+hi)*.5,a,b,c,d).y;
}
`;
