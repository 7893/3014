import { skyEffects } from "../../../rendering/shaders/sky.ts";
export const night = `
${skyEffects}
vec3 windowNight(vec3 color,vec2 p){
  vec2 uv=(p-u_window.xy)/u_window.zw;
  if(any(lessThan(uv,vec2(0)))||any(greaterThan(uv,vec2(1))))return color;
  // Window bars and distant mountains remain in front of every sky effect.
  vec2 pixel=(p-u_window.xy)*u_size;
  vec2 span=u_window.zw*u_size;
  float bars=step(3.,min(pixel.x,span.x-pixel.x))*step(3.,min(pixel.y,span.y-pixel.y));
  for(int i=1;i<4;i++)bars*=smoothstep(1.,2.5,abs(pixel.x-span.x*float(i)/4.));
  bars*=smoothstep(1.,2.5,abs(pixel.y-span.y*.73));
  float skyMask=bars*(1.-smoothstep(.62,.69,uv.y));
  vec3 stars=skyStars(uv,span,u_time,.89)*.85;
  float moonMask=smoothstep(.053,.065,length((pixel-span*vec2(.69,.27))/span.x));
  color+=stars*skyMask*moonMask;
  // Two continuous cloud banks cross the moon; wrapping occurs outside the window.
  float radius=.053*span.x;
  vec2 moon=(pixel-span*vec2(.69,.27))/radius;
  float cover=0.;
  for(int i=0;i<2;i++){
    float fi=float(i),travel=mod(u_time*.6+fi*20.+17.,40.)-20.;
    vec2 q=moon-vec2(travel,fi*1.8-.35);
    q.y+=(fbm(q*vec2(.6,1.4))-.5)*.18;
    cover=max(cover,cloudBank(q)*(.70-fi*.17));
  }
  return mix(color,vec3(.34,.44,.49),cover*skyMask);
}
`;
