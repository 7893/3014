import { pierAnchor } from "../pier.ts";
// Animated Pixi poses are projected onto the dry-sand side of the shared shoreline.
export const people = `
${pierAnchor}
vec3 pierRipples(vec3 color,vec2 p){
  for(int i=0;i<2;i++){
    vec2 feet=i==0?u_pierFeet.xy:u_pierFeet.zw;
    vec2 q=(p-feet)*vec2(u_size.x/u_size.y,3.6);
    float r=length(q),phase=fract(u_time*.57+float(i)*.5);
    float ring=exp(-pow((r-.002-phase*.016)*850.,2.))*(1.-phase);
    color+=vec3(.22,.29,.22)*ring*(1.-sampleLayer(u_foreground,p).a);
  }
  return color;
}
vec3 pierVisitor(vec3 color,vec2 p){
  vec2 local=(p-pierSeat)*1000.;
  vec2 uv=(local+vec2(32.,21.))/64.;
  if(any(lessThan(uv,vec2(0)))||any(greaterThan(uv,vec2(1))))return color;
  uv.x=(uv.x+2.)/3.;
  return over(color,texture(u_beachCrew,uv));
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
      uv.x=(uv.x+float(i))/3.;
      color=over(color,texture(u_beachCrew,uv));
    }
  }
  return color;
}
`;
