// Analytic slopes of three crossing wave trains; no extra height-map textures.
export const surface = `
vec3 waterNormal(vec2 p,float aspect,float depth){
  vec2 q=vec2(p.x*aspect,p.y);
  vec2 a=vec2(37.,103.),b=vec2(-61.,171.),c=vec2(83.,267.);
  float energy=.7+u_wind.w*.4;
  float t=u_time+u_wind.z*.16;
  vec2 slope=cos(dot(q,a)-t*1.5)*normalize(a)*.060;
  slope+=cos(dot(q,b)+t*1.1)*normalize(b)*.038;
  slope+=cos(dot(q,c)-t*2.0)*normalize(c)*.019;
  return normalize(vec3(-slope*energy*mix(.45,1.,depth),1.));
}
float waterFresnel(vec3 normal,float depth){
  vec3 view=normalize(vec3(0.,-.85,mix(.22,.65,depth)));
  return .025+.975*pow(1.-max(0.,dot(normal,view)),5.);
}
float waterSparkle(vec3 normal){
  return pow(max(0.,dot(normal,normalize(vec3(.035,-.045,1.)))),180.);
}
`;
