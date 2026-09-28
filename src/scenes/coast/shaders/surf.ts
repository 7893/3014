import { shoreline } from "../shore.ts";
export const surf = `
${shoreline}
vec3 paintSurf(vec3 color,vec2 p){
  if(p.y<.78)return color;
  vec4 material=sampleLayer(u_shore,p);
  if(material.b>.5)return color;
  float distance=p.y-beachHeight(p.x);
  float swell=.5+.5*sin(u_time*.78-p.x*5.+u_wind.x*.3);
  float reach=-.012+.032*pow(swell,1.7);
  float grain=noise(vec2(p.x*170.,p.y*300.-u_time*.6));
  float edge=distance-reach+(grain-.5)*.004;
  float wash=(1.-smoothstep(-.002,.003,edge))*smoothstep(-.032,-.003,distance);
  float wetReach=.014+.027*(.5+.5*sin(u_time*.78-p.x*5.-.9));
  float wet=(1.-smoothstep(wetReach,wetReach+.012,distance))*smoothstep(-.003,.005,distance);
  // Damp sand remains dark after the thin sheet of water retreats.
  color=mix(color,color*vec3(.75,.81,.82),wet*material.r*.75);
  color=mix(color,vec3(.53,.73,.63),wash*material.r*.32);
  float sheen=wet*material.r*pow(max(0.,sin(p.y*280.-u_time*1.3+p.x*19.)),12.);
  color+=vec3(.12,.11,.065)*sheen*.5;
  float foam=exp(-pow(edge*430.,2.))*(.45+.55*grain);
  float lace=exp(-pow((edge+.007)*270.,2.))*smoothstep(.53,.76,grain)*(1.-swell)*.6;
  color=mix(color,vec3(.97,.97,.86),clamp((foam+lace)*(1.-material.g),0.,.85));
  // Sample the actual rock mask, so breakers follow the drawn boulders.
  vec2 offset=vec2(3./u_size.x,3./u_size.y);
  float rocks=max(sampleLayer(u_shore,p+vec2(0.,offset.y)).g,max(sampleLayer(u_shore,p+offset).g,sampleLayer(u_shore,p+vec2(-offset.x,offset.y)).g));
  float breaker=rocks*(1.-material.g)*(.35+.65*swell)*(.55+.45*grain);
  color=mix(color,vec3(.94,.97,.87),breaker*.8);
  return color;
}
`;
