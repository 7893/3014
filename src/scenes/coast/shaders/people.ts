import { BEACH_RUN } from "../../../config/actors.ts";
export const people = `
vec3 beachPeople(vec3 color,vec2 p){
  if(p.y<.84||p.x>.27)return color;
  float pixelScale=max(.50,min(u_size.x,u_size.y)/850.);
  for(int i=0;i<2;i++){
    float phase=u_time*${BEACH_RUN.speed}-float(i)*${BEACH_RUN.lag};
    float x=${BEACH_RUN.x}+${BEACH_RUN.range}*sin(phase);
    float y=beachHeight(x)+.053+float(i)*.009+${BEACH_RUN.orbit}*cos(phase);
    vec2 local=(p-vec2(x,y))*u_size/pixelScale;
    vec2 uv=(local+vec2(32.,57.))/vec2(64.);
    if(all(greaterThanEqual(uv,vec2(0)))&&all(lessThanEqual(uv,vec2(1)))){
      uv.x=(uv.x+float(i))/2.;
      color=over(color,texture(u_beachCrew,uv));
    }
  }
  return color;
}
`;
