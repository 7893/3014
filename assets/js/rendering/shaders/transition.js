import { noise } from "./common.js";
export const fragment = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_ink,u_city;
uniform vec2 u_size;
uniform float u_blend,u_time;
${noise}
vec3 inkAt(vec2 uv){
  vec2 pixel=1./u_size;
  vec3 c=texture(u_ink,uv).rgb;
  vec3 bleed=min(c,min(texture(u_ink,uv-pixel*vec2(.9,.25)).rgb,texture(u_ink,uv+pixel*vec2(.8,.4)).rgb));
  c=mix(c,bleed,.13+noise(gl_FragCoord.xy*.34)*.10);
  return c+vec3((hash(gl_FragCoord.xy)-.5)*.007);
}
void main(){
  float t=u_blend;
  vec3 color;
  if(t<.001)color=inkAt(v_uv);
  else if(t>.999)color=texture(u_city,v_uv).rgb;
  else{
    vec3 a=inkAt(vec2(clamp(v_uv.x+t*.15,0.,1.),v_uv.y));
    vec3 b=texture(u_city,vec2(clamp(v_uv.x-(1.-t)*.15,0.,1.),v_uv.y)).rgb;
    float cloud=fbm(vec2(v_uv.x*4.-u_time*.035,v_uv.y*5.));
    float curtain=pow(sin(t*3.14159265),1.4);
    float wipe=smoothstep(.2,.8,t+(cloud-.5)*.23);
    color=mix(a,b,wipe);
    color=mix(color,mix(vec3(.91,.9,.83),vec3(.48,.57,.60),t),curtain*(.80+cloud*.19));
  }
  outColor=vec4(color,1.);
}
`;
