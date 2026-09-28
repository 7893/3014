export const birds = `
vec3 paintBirds(vec3 color,vec2 p){
  // One small flock crosses the valley, with a quiet interval between visits.
  float passage=mod(u_time+8.,39.);
  if(passage>24.||p.y<.29||p.y>.57)return color;
  float aspect=u_size.x/u_size.y;
  for(int i=0;i<3;i++){
    float f=float(i),x=-.16+passage*.055-f*.034;
    float y=.43+sin(x*5.)*.038+f*.016;
    vec2 q=(p-vec2(x,y))*vec2(aspect,1.);
    q/=min(aspect,1.)*(.008-f*.0012);
    float flap=sin(u_time*5.3+f*1.8)*.55;
    float wingY=-abs(q.x)*flap+.16*q.x*q.x;
    float stroke=(1.-smoothstep(.09,.22,abs(q.y-wingY)))*(1.-smoothstep(.7,1.1,abs(q.x)));
    color=mix(color,vec3(.26,.31,.27),stroke*(.68-f*.1));
  }
  return color;
}
`;
