export const sky = `
vec2 sunCenter(){return u_size.x/u_size.y<.85?vec2(.32,.12):vec2(.72,.205);}
float sunRadius(){return min(u_size.x/u_size.y,1.)*.039;}
vec3 paintSun(vec3 paper,vec2 p){
  float aspect=u_size.x/u_size.y;
  float radius=sunRadius();
  float r=length((p-sunCenter())*vec2(aspect,1.));
  float edge=radius+(noise(p*180.)-.5)*radius*.035;
  float disc=1.-smoothstep(edge-radius*.025,edge+radius*.025,r);
  return mix(paper,vec3(.64,.36,.23),disc*.23);
}
float cloudLobe(vec2 q,vec2 center,vec2 size){
  return 1.-smoothstep(.72,1.08,length((q-center)/size));
}
vec3 paintPassingCloud(vec3 color,vec3 paper,vec2 p){
  // One continuous cloud crosses the lower half of the sun, then leaves clear sky.
  float age=mod(u_time,40.);
  float presence=smoothstep(0.,1.5,age)*(1.-smoothstep(18.,23.,age));
  if(presence<.001)return color;
  vec2 q=(p-sunCenter())*vec2(u_size.x/u_size.y,1.)/sunRadius();
  q.x-= -5.+age*.65;
  q.y+=sin(q.x*.7+u_time*.2)*.045;
  if(abs(q.x)>6.||q.y<-.35||q.y>1.6)return color;
  vec2 warped=q+vec2(0.,(fbm(q*vec2(2.3,3.1))-.5)*.12);
  float cloud=cloudLobe(warped,vec2(0.,.67),vec2(3.2,.59));
  cloud=max(cloud,cloudLobe(warped,vec2(1.,.48),vec2(1.7,.50)));
  cloud=max(cloud,cloudLobe(warped,vec2(-1.5,.62),vec2(1.7,.43)));
  cloud=max(cloud,cloudLobe(warped,vec2(-3.1,.85),vec2(2.,.25))*.73);
  float fibre=fbm(q*vec2(2.1,6.));
  float shade=smoothstep(.35,1.25,q.y)*.038+(1.-cloud)*.026;
  vec3 pigment=paper+vec3(.018,.018,.012)-vec3(shade);
  float opacity=cloud*presence*(.87+fibre*.11);
  return mix(color,pigment,opacity);
}
`;
