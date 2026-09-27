import { noise } from "./common.js";
export const fragment = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_buildings,u_lights,u_bank,u_boatLayer;
uniform vec2 u_size,u_boat,u_boatCenter,u_actorScale;
uniform float u_time;
uniform vec3 u_touch;
${noise}
vec3 stars(vec2 p){
  // Stable sky positions, with pixel-sized cores on every screen.
  vec2 grid=vec2(26.*u_size.x/u_size.y,26.);
  vec2 cell=floor(p*grid);
  float seed=hash(cell+17.3);
  vec2 center=(cell+.18+.64*vec2(hash(cell+3.7),hash(cell+9.2)))/grid;
  vec2 delta=(p-center)*u_size;
  float radius=mix(.65,1.15,seed);
  float core=exp(-dot(delta,delta)/(radius*radius));
  float glow=exp(-dot(delta,delta)/20.)*.22;
  float twinkle=.22+1.05*pow(.5+.5*sin(u_time*(1.1+seed*.9)+seed*83.),1.4);
  float visible=step(.84,seed)*(1.-smoothstep(.16,.48,p.y));
  return mix(vec3(.65,.79,1.),vec3(1.,.88,.65),seed)*(core+glow)*twinkle*visible;
}
vec3 animatedLights(vec2 p){
  vec4 lamps=sampleLayer(u_lights,p);
  float cells=hash(floor(p*vec2(240.,180.)));
  float windows=.38+1.05*smoothstep(-.7,.7,sin(u_time*(.55+cells*.35)+cells*65.));
  float river=smoothstep(.565,.595,p.y);
  float sweep=pow(.5+.5*sin(p.x*15.-u_time*.95),5.);
  float bridge=.65+1.25*sweep;
  vec3 warmth=mix(vec3(1.,.95,.87),vec3(1.1,.88,.65),sweep*river);
  return lamps.rgb*lamps.a*mix(windows,bridge,river)*warmth;
}
vec3 skyline(vec2 p){
  vec3 top=vec3(.025,.052,.079),horizon=vec3(.17,.22,.245);
  vec3 color=mix(top,horizon,pow(clamp(p.y/.72,0.,1.),1.7));
  float haze=fbm(vec2(p.x*4.-u_time*.012,p.y*8.));
  color+=vec3(.035,.035,.028)*haze*smoothstep(.2,.7,p.y);
  color+=stars(p);
  color=over(color,sampleLayer(u_buildings,p));
  color+=animatedLights(p);
  return color;
}
float lineMark(vec2 p,vec2 a,vec2 b,float width){vec2 d=b-a;return 1.-smoothstep(width,width+0.35,length(p-a-d*clamp(dot(p-a,d)/dot(d,d),0.,1.)));}
void main(){
  vec2 p=vec2(v_uv.x,1.-v_uv.y);
  vec3 color=skyline(p);
  if(p.y>.64){
    float depth=(p.y-.64)/.36;
    float waves=sin(p.y*210.-u_time*1.65+p.x*9.)*.34+sin(p.y*437.+u_time*1.2+p.x*23.)*.16;
    waves+=(noise(vec2(p.x*85.,p.y*180.-u_time*.65))-.5)*.5;
    vec2 reflected=vec2(p.x+waves*(.0015+depth*.005),.635-(p.y-.64)*1.28+waves*.002);
    vec3 lamps=animatedLights(reflected);
    vec3 reflectedCity=skyline(reflected);
    vec3 water=mix(vec3(.055,.13,.18),vec3(.025,.075,.12),depth);
    float breaks=.35+.65*noise(vec2(p.x*95.,p.y*640.-u_time*1.5));
    color=mix(water,reflectedCity,.26*(1.-depth*.5));
    color+=lamps*breaks*(1.25-depth*.45);
    vec3 spread=animatedLights(reflected+vec2(.002,0.))+animatedLights(reflected-vec2(.002,0.));
    color+=spread*breaks*.18;
    color+=vec3(.13,.16,.17)*pow(max(0.,sin(p.y*485.+p.x*13.-u_time*1.6)),18.)*.055;
    vec2 boat=u_boatCenter+u_boat;
    float behind=boat.x-p.x,wy=abs(p.y-boat.y-.009);
    float wake=exp(-pow((wy-(.002+max(behind,0.)*.095))*400.,2.));
    wake*=smoothstep(.005,.02,behind)*(1.-smoothstep(.06,.19,behind));
    color+=vec3(.37,.30,.16)*wake*.24;
    float age=u_time-u_touch.z;
    float distance=waterDistance(p,u_touch.xy,u_size.x/u_size.y,.64);
    color+=vec3(.10,.13,.14)*sin(distance*140.-age*5.)*exp(-pow((distance-age*.035)*12.,2.))*exp(-max(age,0.)*.5)*step(0.,age);
  }
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
  bankP.x+=sin(u_time*.85+p.y*15.)*.0013*clamp((.86-p.y)/.17,0.,1.)*(1.-smoothstep(.12,.23,p.x));
  vec4 bank=sampleLayer(u_bank,bankP);
  color=over(color,bank);
  vec4 boat=sampleLayer(u_boatLayer,p-u_boat);
  vec4 neighbor=sampleLayer(u_boatLayer,p-u_boat+vec2(0.,1.2/u_size.y));
  float rim=max(0.,neighbor.a-boat.a*(1.-bank.a));
  color=mix(color,vec3(.035,.07,.085),boat.a*(1.-bank.a));
  color+=vec3(.85,.60,.28)*rim*.65*(1.-bank.a);
  vec2 local=(p-u_boatCenter-u_boat)/u_actorScale;
  vec2 end=vec2(31.+sin(u_time*2.)*7.,6.+cos(u_time*2.)*6.);
  float oar=lineMark(local,vec2(15.,-5.),end,.65);
  color=mix(color,vec3(.68,.56,.35),oar*.8*(1.-bank.a));
  float lantern=exp(-dot((local-vec2(-5.,-5.))/vec2(2.5,3.),(local-vec2(-5.,-5.))/vec2(2.5,3.)));
  color+=vec3(.9,.51,.18)*lantern*.65*(1.-bank.a);
  color*=1.-.18*pow(length((p-.5)*vec2(1.,.8)),2.);
  color+=vec3((hash(gl_FragCoord.xy)-.5)*.006);
  outColor=vec4(color,1.);
}
`;
