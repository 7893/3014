import { pierWater } from "../pier.ts";
// Animated Pixi poses are projected onto the dry-sand side of the shared shoreline.
export const people = `
${pierWater}
vec3 pierRipples(vec3 color,vec2 p){
  vec2 q=(p-pierFeet)*vec2(u_size.x/u_size.y,4.);
  float r=length(q), phase=mod(u_time*.38,1.);
  float ring=exp(-pow((r-.003-phase*.018)*900.,2.))*(1.-phase);
  return color+vec3(.13,.18,.13)*ring*(1.-sampleLayer(u_foreground,p).a);
}

vec3 beachPeople(vec3 color,vec2 p){
  if(p.y<.84||p.x>.27)return color;
  float pixelScale=max(.50,min(u_size.x,u_size.y)/850.);
  for(int i=0;i<2;i++){
    float phase=u_time*.27-float(i)*.55;
    float x=.115+.067*sin(phase);
    float y=beachHeight(x)+.053+float(i)*.009;
    vec2 local=(p-vec2(x,y))*u_size/pixelScale;
    float facing=clamp(cos(phase)*5.,-1.,1.);
    local.x/=sign(facing)*max(abs(facing),.24);
    vec2 uv=(local+vec2(32.,57.))/vec2(64.);
    if(all(greaterThanEqual(uv,vec2(0)))&&all(lessThanEqual(uv,vec2(1)))){
      uv.x=(uv.x+float(i))*.5;
      color=over(color,texture(u_beachCrew,uv));
    }
  }
  return color;
}
`;
