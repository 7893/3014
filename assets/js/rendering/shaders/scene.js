import { noise } from "./common.js";
import { mist } from "./mist.js";
import { water } from "./water.js";
export const fragment = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_paper,u_far,u_middle,u_near,u_shore,u_pines,u_boatLayer;
uniform vec2 u_size,u_boat,u_boatCenter;
uniform float u_time,u_mobile;
uniform vec3 u_touch;
${noise}
${mist}
${water}
void main(){
  vec2 p=vec2(v_uv.x,1.-v_uv.y);
  vec3 paper=texture(u_paper,v_uv).rgb;
  vec3 color=over(paper,texture(u_far,v_uv));
  color=mix(color,paper,mistLayer(p,.47,0.));
  color=over(color,texture(u_middle,v_uv));
  if(u_mobile<.5)color=mix(color,paper,mistLayer(p,.56,1.));
  color=over(color,texture(u_near,v_uv));
  color=mix(color,paper,mistLayer(p,.665,2.));
  color=paintWater(color,paper,p);
  color=over(color,texture(u_shore,v_uv));
  float bend=pow(clamp((.89-p.y)/.27,0.,1.),2.);
  float wind=(sin(u_time*.62+p.y*13.)*.65+sin(u_time*1.13+p.x*21.)*.35)*.0024*bend;
  color=over(color,sampleLayer(u_pines,p+vec2(wind,0.)));
  // The small boat moves independently of the paper and mountain layers.
  color=over(color,sampleLayer(u_boatLayer,p-u_boat));
  vec2 boatReflection=vec2(p.x-u_boat.x,2.*(u_boatCenter.y+u_boat.y)-p.y-u_boat.y);
  vec4 reflectedBoat=sampleLayer(u_boatLayer,boatReflection+vec2(sin(p.y*250.-u_time)*.002,0.));
  reflectedBoat.a*=smoothstep(u_boatCenter.y+.004+u_boat.y,u_boatCenter.y+.009+u_boat.y,p.y)*.15;
  color=over(color,reflectedBoat);
  outColor=vec4(color,1.);
}
`;
