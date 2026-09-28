import { sails } from "./sails.js";
import { horizon } from "./horizon.js";
import { surf } from "./surf.js";
import { wind } from "./wind.js";
import { surface } from "../../../rendering/shaders/surface.js";
import { noise } from "../../../rendering/shaders/common.js";
import { boat } from "../../../rendering/shaders/boat.js";
import { ripples } from "../../../rendering/shaders/ripples.js";
export const fragment = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_foreground,u_trunk0,u_leaves0,u_trunk1,u_leaves1,u_shore,u_boatLayer;
uniform vec2 u_size,u_boat,u_boatCenter,u_actorScale;
uniform float u_time;
uniform vec3 u_touch;
uniform vec4 u_wind;
${noise}
${surface}
${boat}
${ripples}
${wind}
${surf}
${sails}
${horizon}
float coastWaterAt(vec2 p){
  float solid=max(sampleLayer(u_foreground,p).a,sampleBoat(p-u_boat).a);
  solid=max(solid,sampleLayer(u_trunk0,palmUV(p,vec2(.035,.965),vec2(.09,.495),0.,false)).a);
  solid=max(solid,sampleLayer(u_leaves0,palmUV(p,vec2(.035,.965),vec2(.09,.495),0.,true)).a);
  solid=max(solid,sampleLayer(u_trunk1,palmUV(p,vec2(-.025,.945),vec2(.145,.605),.8,false)).a);
  solid=max(solid,sampleLayer(u_leaves1,palmUV(p,vec2(-.025,.945),vec2(.145,.605),.8,true)).a);
  return smoothstep(.48,.50,p.y)*(1.-smoothstep(.08,.35,solid));
}
void main(){
  vec2 p=vec2(v_uv.x,1.-v_uv.y);
  float aspect=u_size.x/u_size.y;
  vec3 color=mix(vec3(.38,.66,.74),vec3(.99,.86,.65),smoothstep(0.,.49,p.y));
  vec2 sun=(p-vec2(.32,.28))*vec2(aspect,1.);
  float disc=1.-smoothstep(.033,.036,length(sun));
  color+=vec3(.27,.19,.08)*exp(-length(sun)*13.);
  color=mix(color,vec3(1.,.96,.78),disc);
  vec2 cloudP=vec2(p.x*3.-u_wind.z*.10,p.y*13.+sin(u_time*.18)*.08);
  float cloud=fbm(cloudP);
  color=mix(color,vec3(1.,.94,.80),smoothstep(.48,.73,cloud)*.62*(1.-smoothstep(.3,.44,p.y)));
  color=paintIslands(color,p);
  if(p.y>.473){
    vec3 skyEdge=color;
    float depth=max(0.,(p.y-.475)/.525);
    vec2 flow=vec2(p.x*45.,p.y*150.-u_time*.65);
    vec3 normal=waterNormal(p,aspect,depth);
    float fresnel=waterFresnel(normal,depth);
    float perspective=log(1.+depth*16.)*65.;
    float ripple=sin(perspective-u_time*1.3+noise(flow)*2.);
    color=mix(vec3(.12,.43,.49),vec3(.43,.76,.67),pow(depth,.65));
    color=mix(color,vec3(.70,.81,.75),fresnel*.45);
    color=mix(vec3(.64,.74,.69),color,smoothstep(0.,.24,depth));
    float caustic=pow(1.-abs(sin(fbm(flow*.34+vec2(u_time*.045,0.))*24.)),18.);
    color+=vec3(.055,.085,.048)*caustic*smoothstep(.2,.9,depth);
    float glint=exp(-pow((p.x-.32)/(.014+depth*.12),2.));
    color=mix(color,vec3(1.,.91,.68),glint*waterSparkle(normal)*(.32+depth*.22)*(.25+.75*pow(max(0.,ripple),3.)));
    float wavePatch=smoothstep(.28,.72,noise(vec2(p.x*21.+u_time*.08,p.y*37.)));
    color+=vec3(.17,.24,.19)*pow(max(0.,ripple),25.)*.13*smoothstep(.03,.4,depth)*wavePatch;
    vec2 boat=u_boatCenter+u_boat;
    float behind=boat.x-p.x,wy=abs(p.y-boat.y-.009);
    float wake=exp(-pow((wy-(.002+max(behind,0.)*.095))*400.,2.))*smoothstep(.005,.02,behind)*(1.-smoothstep(.06,.19,behind));
    color+=vec3(.35,.40,.23)*wake*.6;
    color+=vec3(.12,.15,.10)*touchRipple(p,.475,coastWaterAt(u_touch.xy));
    color=mix(skyEdge,color,smoothstep(.473,.481,p.y));
  }
  color=paintSails(color,p,aspect);
  vec4 boat=sampleBoat(p-u_boat);
  color=mix(color,vec3(.18,.24,.19),boat.a);
  color=over(color,sampleLayer(u_foreground,p));
  color=paintSurf(color,p);
  vec2 root0=vec2(.035,.965),crown0=vec2(.09,.495);
  vec2 root1=vec2(-.025,.945),crown1=vec2(.145,.605);
  color=over(color,sampleLayer(u_trunk0,palmUV(p,root0,crown0,0.,false)));
  color=over(color,sampleLayer(u_leaves0,palmUV(p,root0,crown0,0.,true)));
  color=over(color,sampleLayer(u_trunk1,palmUV(p,root1,crown1,.8,false)));
  color=over(color,sampleLayer(u_leaves1,palmUV(p,root1,crown1,.8,true)));
  color+=vec3((hash(gl_FragCoord.xy)-.5)*.006);
  outColor=vec4(color,1.);
}
`;
