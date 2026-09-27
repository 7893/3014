export const water = `
vec3 paintWater(vec3 color,vec3 paper,vec2 p){
  float river=smoothstep(.725,.75,p.y)*(1.-smoothstep(.925,.985,p.y));
  if(river<.001)return color;
  float depth=(p.y-.73)/.25;
  vec3 normal=waterNormal(p,u_size.x/u_size.y,depth);
  float fresnel=waterFresnel(normal,depth);
  float flow=sin(p.y*155.-u_time*1.8+p.x*12.)*.6+sin(p.y*287.+u_time*1.35)*.3;
  float age=u_time-u_touch.z;
  float distance=waterDistance(p,u_touch.xy,u_size.x/u_size.y,.73);
  float ring=sin(distance*135.-age*5.)*exp(-pow((distance-age*.034)*12.,2.))*exp(-max(age,0.)*.5)*step(0.,age);
  vec2 reflected=vec2(p.x+normal.x*.09*depth+flow*.005*depth+ring*.006,.73-(p.y-.73)*2.05+flow*.004);
  vec3 reflection=paper;
  reflection=over(reflection,sampleLayer(u_far,reflected));
  reflection=over(reflection,sampleLayer(u_middle,reflected));
  reflection=over(reflection,sampleLayer(u_near,reflected));
  float broken=.55+.45*smoothstep(-.5,.8,sin(p.y*560.+flow*2.));
  float fade=(1.-smoothstep(.80,.99,p.y))*(.40+fresnel*.25)*river*broken;
  color=mix(color,reflection,fade);
  float ripples=pow(max(0.,sin(p.y*470.+sin(p.x*29.+u_time*.38)*2.-u_time*1.65)),14.);
  color+=vec3(.05,.045,.025)*waterSparkle(normal)*river*.35;
  color-=vec3(.11,.12,.09)*ripples*river*.18;
  vec2 boat=u_boatCenter+u_boat;
  float behind=boat.x-p.x;
  float wakeWidth=.003+max(behind,0.)*.095;
  float wakeY=abs(p.y-boat.y-.008);
  float banks=exp(-pow((wakeY-wakeWidth)*430.,2.));
  float trail=exp(-wakeY*170.)*(.5+.5*sin(behind*340.-u_time*3.));
  float fadeWake=smoothstep(.008,.025,behind)*(1.-smoothstep(.04,.19,behind));
  color-=vec3(.13,.14,.11)*(banks*.8+trail*.35)*fadeWake*u_boatOpacity;
  color-=vec3(.055)*ring*river*exp(-distance*3.);
  return color;
}
`;
