import { noise } from "./common.ts";
export const fragment = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_source,u_destination;
uniform vec2 u_size;
uniform float u_blend,u_time;
uniform bool u_sourceInk,u_destinationInk;
${noise}
vec3 sceneAt(sampler2D source,vec2 uv,bool ink){
  vec3 c=texture(source,uv).rgb;
  if(!ink)return c;
  vec2 pixel=1./u_size;
  vec3 bleed=min(c,min(texture(source,uv-pixel*vec2(.9,.25)).rgb,texture(source,uv+pixel*vec2(.8,.4)).rgb));
  return mix(c,bleed,.13+noise(gl_FragCoord.xy*.34)*.10)+vec3((hash(gl_FragCoord.xy)-.5)*.007);
}
void main(){
  float t=u_blend;vec3 color;
  if(t<.001)color=sceneAt(u_source,v_uv,u_sourceInk);
  else if(t>.999)color=sceneAt(u_destination,v_uv,u_destinationInk);
  else{
    vec3 a=sceneAt(u_source,vec2(clamp(v_uv.x+t*.15,0.,1.),v_uv.y),u_sourceInk);
    vec3 b=sceneAt(u_destination,vec2(clamp(v_uv.x-(1.-t)*.15,0.,1.),v_uv.y),u_destinationInk);
    float cloud=fbm(vec2(v_uv.x*4.-u_time*.035,v_uv.y*5.));
    float curtain=pow(sin(t*3.14159265),1.4);
    color=mix(a,b,smoothstep(.2,.8,t+(cloud-.5)*.23));
    color=mix(color,mix(vec3(.82,.85,.79),color,.25),curtain*(.80+cloud*.19));
  }
  outColor=vec4(color,1.);
}
`;
