export const wind = `
vec2 palmUV(vec2 p,vec2 root,vec2 crown,float phase,bool leaves){
  float height=root.y-crown.y;
  float bend=leaves?1.:pow(clamp((root.y-p.y)/height,0.,1.),2.);
  float sway=u_wind.x*.006+sin(u_time*.48+phase)*.001;
  vec2 q=p-vec2(sway*bend,0.);
  if(leaves){
    vec2 local=(q-crown)*vec2(u_size.x/u_size.y,1.);
    float tip=smoothstep(.008,height*.42,length(local));
    float lag=length(local)/height*2.5;
    float flutter=(u_wind.y-u_wind.x)*.010;
    flutter+=sin(u_time*.86+phase-lag)*.0015*u_wind.w;
    q.x-=flutter*tip;
    q.y-=(u_wind.y*.002+sin(u_time*.86+phase-lag+.8)*.001)*tip;
  }
  return q;
}
`;
