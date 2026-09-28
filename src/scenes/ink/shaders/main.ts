import { surface } from "../../../rendering/shaders/surface.ts";
import { noise } from "../../../rendering/shaders/common.ts";
import { mist } from "./mist.ts";
import { water } from "./water.ts";
import { wildlife } from "./wildlife.ts";
import { sky } from "./sky.ts";
import { birds } from "./birds.ts";
import { boat } from "../../../rendering/shaders/boat.ts";
import { ripples } from "../../../rendering/shaders/ripples.ts";
export const fragment = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_paper,u_far,u_middle,u_near,u_shore,u_foliage,u_boatLayer;
uniform vec2 u_size,u_boat,u_boatCenter,u_actorScale;
uniform float u_time;
uniform vec3 u_touch,u_environment;
uniform vec4 u_wind;
uniform vec4 u_fish[3],u_fishRipples[3];
${noise}
${surface}
${boat}
${ripples}
${mist}
${water}
${wildlife}
${sky}
${birds}
void main(){
  vec2 p=vec2(v_uv.x,1.-v_uv.y);
  vec3 paper=texture(u_paper,p).rgb;
  vec3 color=mountainLayer(paintSun(paper,p),texture(u_far,p),paper,.18);
  color=mix(color,paper,mistLayer(p,.47,0.));
  color=paintBirds(color,p);
  color=mountainLayer(color,texture(u_middle,p),paper,.07);
  color=mix(color,paper,mistLayer(p,.56,1.));
  color=over(color,texture(u_near,p));
  color=mix(color,paper,mistLayer(p,.665,2.));
  color=paintPassingCloud(color,paper,p);
  color=paintWater(color,paper,p);
  color=paintFish(color,p);
  color=over(color,texture(u_shore,p));
  float bend=pow(clamp((.89-p.y)/.27,0.,1.),2.);
  float wind=(u_wind.x*.75+sin(u_time*.85+p.y*13.)*.20)*.008*bend;
  color=over(color,sampleLayer(u_foliage,p+vec2(wind,0.)));
  // The small boat moves independently of the paper and mountain layers.
  vec4 boatInk=sampleBoat(p-u_boat);
  color=over(color,boatInk);
  vec2 boatReflection=vec2(p.x-u_boat.x,2.*(u_boatCenter.y+u_boat.y)-p.y-u_boat.y);
  vec4 reflectedBoat=sampleBoat(boatReflection+vec2(sin(p.y*250.-u_time)*.002,0.));
  reflectedBoat.a*=smoothstep(u_boatCenter.y+.004+u_boat.y,u_boatCenter.y+.009+u_boat.y,p.y)*.24;
  color=over(color,reflectedBoat);
  outColor=vec4(color,1.);
}
`;
