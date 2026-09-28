import { BOAT_FRAME } from "../../config/actors.ts";
const { x, y, width, height } = BOAT_FRAME;
// Pixi renders actor coverage and an oar mask into a small shared texture.
export const boat = `
vec4 boatMasks(vec2 p){
  vec2 uv=((p-u_boatCenter)/u_actorScale+vec2(${x}.,${y}.))/vec2(${width}.,${height}.);
  if(any(lessThan(uv,vec2(0)))||any(greaterThan(uv,vec2(1))))return vec4(0);
  return texture(u_boatLayer,uv);
}
vec4 sampleBoat(vec2 p){return vec4(.169,.224,.192,boatMasks(p).a);}
`;
