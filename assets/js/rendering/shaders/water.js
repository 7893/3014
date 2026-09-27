export const water = `
vec3 paintWater(vec3 color,vec3 paper,vec2 p){
  float river=smoothstep(.725,.75,p.y)*(1.-smoothstep(.925,.985,p.y));
  if(river<.001)return color;
  float depth=(p.y-.73)/.25;
  float flow=sin(p.y*155.-u_time*.88+p.x*12.)*.6+sin(p.y*287.+u_time*.57)*.3;
  float age=u_time-u_touch.z;
  vec2 d=(p-u_touch.xy)*vec2(u_size.x/u_size.y,1.);
  float distance=length(d);
  float ring=sin(distance*135.-age*5.)*exp(-pow((distance-age*.034)*12.,2.))*exp(-max(age,0.)*.5)*step(0.,age);
  vec2 reflected=vec2(p.x+flow*.009*depth+ring*.006,.73-(p.y-.73)*2.05+flow*.002);
  vec3 reflection=paper;
  reflection=over(reflection,sampleLayer(u_far,reflected));
  reflection=over(reflection,sampleLayer(u_middle,reflected));
  reflection=over(reflection,sampleLayer(u_near,reflected));
  float broken=.55+.45*smoothstep(-.5,.8,sin(p.y*560.+flow*2.));
  float fade=(1.-smoothstep(.80,.99,p.y))*.32*river*broken;
  color=mix(color,reflection,fade);
  float ripples=pow(max(0.,sin(p.y*470.+sin(p.x*29.+u_time*.15)*2.-u_time*.8)),22.);
  color-=vec3(.11,.12,.09)*ripples*river*.055;
  vec2 boat=u_boatCenter+u_boat;
  float wakeY=p.y-boat.y;
  float wake=exp(-abs(wakeY)*260.)*exp(-abs(p.x-boat.x+.045)*30.);
  wake*=(1.-smoothstep(boat.x-.045,boat.x,p.x))*(1.-smoothstep(.03,.13,boat.x-p.x));
  color-=vec3(.06)*wake*(.5+.5*sin(p.x*290.-u_time));
  color-=vec3(.055)*ring*river*exp(-distance*3.);
  return color;
}
`;
