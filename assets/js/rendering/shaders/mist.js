export const mist = `
vec3 mountainLayer(vec3 base,vec4 paint,vec3 paper,float distance){
  // Distant pigment picks up the colour of the intervening air.
  paint.rgb=mix(paint.rgb,paper,distance);
  return over(base,paint);
}
float mistLayer(vec2 p,float level,float phase){
  float drift=u_wind.z*(.105+phase*.018);
  vec2 q=vec2(p.x*4.2-drift+phase*7.,p.y*19.);
  float billow=fbm(q);
  float center=level+sin(p.x*5.+phase+u_time*.11)*.027;
  float width=.022+billow*.04;
  float ribbon=exp(-pow((p.y-center)/width,2.));
  float thread=exp(-pow((p.y-center-.032)/(width*.42),2.));
  float fibre=fbm(vec2(p.x*9.-drift*.7,p.y*43.+phase));
  return clamp((ribbon*.65+thread*.25)*smoothstep(.23,.68,billow)*(.75+fibre*.3),0.,.72);
}
`;
