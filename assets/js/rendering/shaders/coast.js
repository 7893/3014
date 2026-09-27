import { noise } from "./common.js";
export const fragment = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_foreground,u_boatLayer;
uniform vec2 u_size,u_boat,u_boatCenter,u_actorScale;
uniform float u_time;
uniform vec3 u_touch;
${noise}
void main(){
  vec2 p=vec2(v_uv.x,1.-v_uv.y);
  float aspect=u_size.x/u_size.y;
  vec3 color=mix(vec3(.38,.66,.74),vec3(.99,.86,.65),smoothstep(0.,.49,p.y));
  vec2 sun=(p-vec2(.32,.28))*vec2(aspect,1.);
  float disc=1.-smoothstep(.033,.036,length(sun));
  color+=vec3(.27,.19,.08)*exp(-length(sun)*13.);
  color=mix(color,vec3(1.,.96,.78),disc);
  float cloud=fbm(vec2(p.x*3.-u_time*.009,p.y*16.));
  color=mix(color,vec3(1.,.94,.80),smoothstep(.57,.76,cloud)*.35*(1.-smoothstep(.3,.44,p.y)));
  float island=.468-.033*exp(-pow((p.x-.85)*6.,2.))-.013*noise(vec2(p.x*20.,0.));
  if(p.y>island&&p.y<.478)color=mix(vec3(.28,.46,.44),vec3(.36,.52,.48),p.x);
  if(p.y>.475){
    float depth=(p.y-.475)/.525;
    vec2 flow=vec2(p.x*45.,p.y*150.-u_time*.65);
    float ripple=sin(p.y*260.-u_time*1.3+noise(flow)*2.);
    color=mix(vec3(.12,.43,.49),vec3(.43,.76,.67),pow(depth,.65));
    float caustic=pow(1.-abs(sin(fbm(flow*.34+vec2(u_time*.045,0.))*24.)),18.);
    color+=vec3(.055,.085,.048)*caustic*smoothstep(.2,.9,depth);
    float glint=exp(-pow((p.x-.32)/(.014+depth*.12),2.));
    color+=vec3(1.,.72,.32)*glint*pow(max(0.,ripple),12.)*(.26+depth*.23);
    color+=vec3(.17,.24,.19)*pow(max(0.,ripple),25.)*.18;
    float shore=.855+.38*pow(max(p.x,0.),.8);
    float wave=sin(p.y*58.-u_time*1.1+p.x*5.);
    float foam=exp(-pow((p.y-shore+.026+wave*.008)*240.,2.));
    color=mix(color,vec3(.95,.95,.80),foam*.7);
    vec2 boat=u_boatCenter+u_boat;
    float behind=boat.x-p.x,wy=abs(p.y-boat.y-.009);
    float wake=exp(-pow((wy-(.002+max(behind,0.)*.095))*400.,2.))*smoothstep(.005,.02,behind)*(1.-smoothstep(.06,.19,behind));
    color+=vec3(.35,.40,.23)*wake*.6;
    float age=u_time-u_touch.z,d=length((p-u_touch.xy)*vec2(aspect,1.));
    color+=vec3(.12,.15,.10)*sin(d*140.-age*5.)*exp(-pow((d-age*.035)*12.,2.))*exp(-max(age,0.)*.5)*step(0.,age);
  }
  vec4 boat=sampleLayer(u_boatLayer,p-u_boat);
  color=mix(color,vec3(.18,.24,.19),boat.a);
  vec2 q=p;q.x+=sin(u_time*.8+p.y*9.)*.002*(1.-smoothstep(.5,.9,p.y))*(1.-smoothstep(.15,.4,p.x));
  color=over(color,sampleLayer(u_foreground,q));
  color+=vec3((hash(gl_FragCoord.xy)-.5)*.006);
  outColor=vec4(color,1.);
}
`;
