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
vec3 skyline(vec2 p){
  vec3 top=vec3(.035,.085,.13),horizon=vec3(.23,.31,.36);
  vec3 color=mix(top,horizon,pow(clamp(p.y/.72,0.,1.),1.7));
  float haze=fbm(vec2(p.x*4.-u_time*.012,p.y*8.));
  color+=vec3(.035,.035,.028)*haze*smoothstep(.2,.7,p.y);
  color=over(color,sampleLayer(u_buildings,p));
  vec4 lights=sampleLayer(u_lights,p);
  float cells=hash(floor(p*vec2(240.,180.)));
  float flicker=.78+.22*smoothstep(-.3,.5,sin(u_time*(.13+cells*.10)+cells*65.));
  color+=lights.rgb*lights.a*flicker*.9;
  return color;
}
float lineMark(vec2 p,vec2 a,vec2 b,float width){vec2 d=b-a;return 1.-smoothstep(width,width+0.35,length(p-a-d*clamp(dot(p-a,d)/dot(d,d),0.,1.)));}
void main(){
  vec2 p=vec2(v_uv.x,1.-v_uv.y);
  vec3 color=skyline(p);
  if(p.y>.64){
    float depth=(p.y-.64)/.36;
    float waves=sin(p.y*165.-u_time*1.8+p.x*8.)*.65+sin(p.y*321.+u_time*1.1)*.3;
    vec2 reflected=vec2(p.x+waves*(.004+depth*.011),.635-(p.y-.64)*1.28+waves*.002);
    vec4 lamps=sampleLayer(u_lights,reflected);
    vec3 reflectedCity=skyline(reflected);
    vec3 water=mix(vec3(.055,.13,.18),vec3(.025,.075,.12),depth);
    float breaks=.45+.55*smoothstep(-.7,.8,sin(p.y*590.+waves*2.));
    color=mix(water,reflectedCity,.26*(1.-depth*.5));
    color+=lamps.rgb*lamps.a*breaks*(.65-depth*.35);
    color+=vec3(.13,.16,.17)*pow(max(0.,sin(p.y*485.+p.x*13.-u_time*1.6)),18.)*.14;
    vec2 boat=u_boatCenter+u_boat;
    float behind=boat.x-p.x,wy=abs(p.y-boat.y-.009);
    float wake=exp(-pow((wy-(.002+max(behind,0.)*.095))*400.,2.));
    wake*=smoothstep(.005,.02,behind)*(1.-smoothstep(.06,.19,behind));
    color+=vec3(.37,.30,.16)*wake*.24;
    float age=u_time-u_touch.z;
    float distance=length((p-u_touch.xy)*vec2(u_size.x/u_size.y,1.));
    color+=vec3(.10,.13,.14)*sin(distance*140.-age*5.)*exp(-pow((distance-age*.035)*12.,2.))*exp(-max(age,0.)*.5)*step(0.,age);
  }
  vec2 bankP=p;
  bankP.x+=sin(u_time*.85+p.y*15.)*.0013*clamp((.86-p.y)/.17,0.,1.)*(1.-smoothstep(.12,.23,p.x));
  vec4 bank=sampleLayer(u_bank,bankP);
  color=over(color,bank);
  // A small stream of cars and a warm bus cross the bridge in opposite directions.
  if(abs(p.y-.685)<.009){
    for(int i=0;i<12;i++){
      float fi=float(i),direction=mod(fi,2.)<.5?1.:-1.;
      float x=fract(fi*.137+u_time*direction*(.020+mod(fi,3.)*.005));
      vec2 q=abs(p-vec2(x,.685+direction*.002));
      float w=i==2?.018:.008;
      float body=(1.-smoothstep(w,w+.001,q.x))*(1.-smoothstep(.002,.003,q.y));
      color=mix(color,i==2?vec3(.76,.50,.22):vec3(.15,.23,.28),body);
      float lamp=exp(-pow((p.x-x-w*direction)*u_size.x/2.2,2.)-pow((p.y-.685-direction*.002)*u_size.y/1.5,2.));
      color+=vec3(1.,.78,.42)*lamp*.9;
    }
  }
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
  outColor=vec4(color,1.);
}
`;
