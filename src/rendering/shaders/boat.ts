import { BOAT_FRAME, BOAT_LANTERN } from "../../config/actors.ts";

const { x, y, width, height } = BOAT_FRAME;
// Pixi renders actor coverage and an oar mask into a small shared texture.
export const boat = `
vec4 boatMasks(vec2 p){
  vec2 uv=((p-u_boatCenter)/u_actorScale+vec2(${x}.,${y}.))/vec2(${width}.,${height}.);
  if(any(lessThan(uv,vec2(0)))||any(greaterThan(uv,vec2(1))))return vec4(0);
  return texture(u_boatLayer,uv);
}
vec3 boatLamp(vec3 color,vec2 p,float strength,float time){
  vec2 local=(p-u_boatCenter)/u_actorScale;
  vec2 q=(local-vec2(${BOAT_LANTERN.x.toFixed(1)},${BOAT_LANTERN.y.toFixed(1)}))/vec2(1.5,2.);
  float core=exp(-dot(q,q));
  return color+vec3(.95,.58,.22)*core*strength*(.9+.1*sin(time*3.));
}
vec4 sampleBoat(vec2 p){return vec4(.169,.224,.192,boatMasks(p).a);}
`;
