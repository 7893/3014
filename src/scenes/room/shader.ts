import { noise } from "../../rendering/shaders/common.ts";
export const fragment = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_interior,u_curtain,u_figures;
uniform vec2 u_size,u_candle,u_couple;
uniform float u_time;
${noise}
void main(){
  vec2 p=vec2(v_uv.x,1.-v_uv.y);
  vec3 color=sampleLayer(u_interior,p).rgb;
  float flicker=.91+.06*sin(u_time*5.7)+.03*sin(u_time*9.2);
  vec2 q=(p-u_candle)*vec2(u_size.x/u_size.y,1.);
  color+=vec3(.29,.14,.045)*exp(-length(q)*12.)*flicker;
  vec2 flame=(p-u_candle)*u_size;
  flame.x-=sin(u_time*4.1+flame.y*.13)*1.1;
  float fire=exp(-dot(flame/vec2(2.7,6.),flame/vec2(2.7,6.)));
  color=mix(color,vec3(1.,.84,.44),fire*flicker);
  vec2 figures=p;
  figures.x-=sin(u_time*.72)*.00055*(1.-smoothstep(u_couple.y-.28,u_couple.y,p.y));
  color=over(color,sampleLayer(u_figures,figures));
  vec2 veil=p;
  veil.x+=sin(p.y*8.+u_time*.55)*.002*smoothstep(.2,.8,p.y);
  color=over(color,sampleLayer(u_curtain,veil));
  for(int i=0;i<9;i++){
    float fi=float(i),age=fract(u_time*.012+fi*.137);
    vec2 center=vec2(.19+sin(fi*7.+age*2.)*.12,.72-age*.43);
    vec2 delta=(p-center)*u_size;
    color+=vec3(.52,.35,.15)*exp(-dot(delta,delta)/2.)*sin(age*3.14159)*.3;
  }
  color*=1.-.6*dot(p-.5,p-.5);
  color+=vec3((hash(gl_FragCoord.xy)-.5)*.003);
  outColor=vec4(color,1.);
}
`;
