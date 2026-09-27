export const mist = `
float mistLayer(vec2 p,float level,float phase){
  float drift=u_time*(.105+phase*.025);
  vec2 q=vec2(p.x*4.2-drift+phase*7.,p.y*13.);
  float billow=fbm(q);
  float center=level+sin(p.x*5.+phase+u_time*.14)*.048;
  float ribbon=exp(-pow((p.y-center)/(0.05+billow*.085),2.));
  return ribbon*smoothstep(.20,.70,billow)*.82;
}
`;
