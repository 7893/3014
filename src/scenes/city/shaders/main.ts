import { skyEffects } from "../../../rendering/shaders/sky.ts";
import { surface } from "../../../rendering/shaders/surface.ts";
import { lights } from "./lights.ts";
import { noise } from "../../../rendering/shaders/common.ts";
import { boat } from "../../../rendering/shaders/boat.ts";
import { ripples } from "../../../rendering/shaders/ripples.ts";
export const fragment = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_buildings,u_lights,u_bank,u_glow,u_windows,u_boatLayer;
uniform vec2 u_size,u_boat,u_boatCenter,u_actorScale;
uniform float u_time;
uniform vec3 u_touch,u_environment;
uniform vec4 u_wind;
${noise}
${surface}
${boat}
${ripples}
${lights}
${skyEffects}
vec3 skyline(vec2 p,vec3 lamps,vec3 spill){
  vec3 top=vec3(.025,.052,.079),horizon=vec3(.17,.22,.245);
  vec3 color=mix(top,horizon,pow(clamp(p.y/.72,0.,1.),1.7));
  float haze=fbm(vec2(p.x*4.-u_wind.z*.018,p.y*8.));
  color+=vec3(.035,.035,.028)*(0.65+u_environment.z)*haze*smoothstep(.2,.7,p.y);
  color+=skyStars(p,u_size,u_time,.84)*(1.-u_environment.y*.8);
  color=over(color,sampleLayer(u_buildings,p));
  color+=lamps;
  color+=spill*.85;
  return color;
}
float cityWaterAt(vec2 p){
  if(!touchActive())return 0.;
  float solid=max(sampleLayer(u_bank,p).a,sampleBoat(p-u_boat).a);
  return smoothstep(.645,.66,p.y)*(1.-smoothstep(.08,.35,solid));
}
void main(){
  vec2 p=vec2(v_uv.x,1.-v_uv.y);
  vec3 color;
  if(p.y>.64){
    float depth=(p.y-.64)/.36;
    float waves=sin(p.y*210.-u_time*1.65+p.x*9.)*.34+sin(p.y*437.+u_time*1.2+p.x*23.)*.16;
    waves+=(noise(vec2(p.x*85.,p.y*180.-u_time*.65))-.5)*.5;
    vec3 normal=waterNormal(p,u_size.x/u_size.y,depth);
    float fresnel=waterFresnel(normal,depth);
    vec2 reflected=vec2(p.x+normal.x*(.012+depth*.07)+waves*.001,.635-(p.y-.64)*1.28+waves*.002);
    vec3 lamps=animatedLights(reflected);
    vec3 spill=lightSpill(reflected);
    vec3 reflectedCity=skyline(reflected,lamps,spill);
    vec3 water=mix(vec3(.055,.13,.18),vec3(.025,.075,.12),depth);
    float breaks=.35+.65*noise(vec2(p.x*95.,p.y*640.-u_time*1.5));
    color=mix(water,reflectedCity,(.23+fresnel*.45)*(1.-depth*.5));
    color+=lamps*breaks*(1.25-depth*.45);
    vec3 spread=animatedLights(reflected+vec2(.002,0.))+animatedLights(reflected-vec2(.002,0.));
    color+=spread*breaks*.18;
    color+=spill*(.65+.35*breaks)*(1.-depth*.6);
    color+=vec3(.08,.11,.12)*waterSparkle(normal)*fresnel;
    color+=vec3(.13,.16,.17)*pow(max(0.,sin(p.y*485.+p.x*13.-u_time*1.6)),18.)*.055;
    vec2 boat=u_boatCenter+u_boat;
    float behind=boat.x-p.x,wy=abs(p.y-boat.y-.009);
    float wake=exp(-pow((wy-(.002+max(behind,0.)*.095))*400.,2.));
    wake*=smoothstep(.005,.02,behind)*(1.-smoothstep(.06,.19,behind));
    color+=vec3(.37,.30,.16)*wake*.24;
    color+=vec3(.10,.13,.14)*touchRipple(p,.64,cityWaterAt(u_touch.xy));
  }else color=skyline(p,animatedLights(p),lightSpill(p));
  // Small pairs walk along the opposite embankment.
  if(p.y>.594&&p.y<.617){
    for(int i=0;i<7;i++){
      float fi=float(i),x=fract(fi*.143+u_time*(mod(fi,2.)<.5?.0018:-.0015));
      vec2 q=(p-vec2(x,.610))*u_size;
      float scale=max(.65,u_size.y/1000.);
      q/=scale;
      float person=(1.-smoothstep(1.,1.6,length(q-vec2(0.,-5.))))+(1.-smoothstep(.9,1.5,abs(q.x)))*step(-3.5,q.y)*step(q.y,1.);
      color=mix(color,vec3(.06,.10,.10),clamp(person,0.,1.)*.8);
    }
  }
  vec2 bankP=p;
  bankP.x+=(u_wind.x*.002+sin(u_time*.85+p.y*15.)*.0005)*clamp((.86-p.y)/.17,0.,1.)*(1.-smoothstep(.12,.23,p.x));
  vec4 bank=sampleLayer(u_bank,bankP);
  color=over(color,bank);
  vec4 boat=sampleBoat(p-u_boat);
  vec4 neighbor=sampleBoat(p-u_boat+vec2(0.,1.2/u_size.y));
  float rim=max(0.,neighbor.a-boat.a*(1.-bank.a));
  color=mix(color,vec3(.035,.07,.085),boat.a*(1.-bank.a));
  color+=vec3(.85,.60,.28)*rim*.65*(1.-bank.a);
  float oar=boatMasks(p-u_boat).r;
  color=mix(color,vec3(.68,.56,.35),oar*.8*(1.-bank.a));
  color=boatLamp(color,p-u_boat,.8*(1.-bank.a),u_time);
  color*=1.-.18*pow(length((p-.5)*vec2(1.,.8)),2.);
  color+=vec3((hash(gl_FragCoord.xy)-.5)*.006);
  outColor=vec4(color,1.);
}
`;
