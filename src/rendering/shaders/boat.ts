// One articulated crew and rigid oar, driven by the shared journey clock.
export const boat = `
float crewLine(vec2 p,vec2 a,vec2 b,float width){
  vec2 d=b-a;
  float distance=length(p-a-d*clamp(dot(p-a,d)/dot(d,d),0.,1.));
  float aa=max(.28,length(fwidth(p))*.5);
  return 1.-smoothstep(width,width+aa,distance);
}
vec2 crewMasks(vec2 local){
  if(local.x<8.||local.x>42.||local.y<-15.||local.y>22.)return vec2(0.);
  float phase=u_time*1.75+.22*sin(u_time*1.75);
  float stroke=sin(phase),lean=stroke*1.1;
  vec2 shoulder=vec2(12.+lean,-7.5);
  vec2 hand=vec2(15.+lean,-5.+cos(phase)*.45);
  float angle=.45+.48*stroke;
  vec2 tip=hand+23.*vec2(cos(angle),sin(angle));
  float body=crewLine(local,shoulder,vec2(12.,-2.),.7);
  body=max(body,crewLine(local,vec2(12.,-2.),vec2(17.,-1.),.65));
  body=max(body,crewLine(local,shoulder,hand,.5));
  float head=1.-smoothstep(1.25,1.85,length(local-shoulder-vec2(.4,-2.7)));
  body=max(body,head);
  float oar=crewLine(local,hand,tip,.4);
  oar=max(oar,crewLine(local,mix(hand,tip,.84),tip,.75));
  return vec2(body*.78,oar*.66);
}
vec4 sampleBoat(vec2 p){
  vec4 hull=sampleLayer(u_boatLayer,p);
  vec2 local=(p-u_boatCenter)/u_actorScale;
  if(local.x<-27.||local.x>42.||local.y<-15.||local.y>22.)return hull;
  vec2 crew=crewMasks(local);
  float alpha=max(crew.x,crew.y);
  float combined=alpha+hull.a*(1.-alpha);
  vec3 paint=vec3(.169,.224,.192);
  return vec4((paint*alpha+hull.rgb*hull.a*(1.-alpha))/max(combined,.0001),combined);
}
`;
