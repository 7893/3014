export const mist = `
float mistLayer(vec2 p,float level,float phase){
  float drift=u_time*(.021+phase*.006);
  vec2 q=vec2(p.x*4.2-drift+phase*7.,p.y*13.);
  float billow=fbm(q);
  float center=level+sin(p.x*5.+phase+u_time*.045)*.026;
  float ribbon=exp(-pow((p.y-center)/(0.042+billow*.075),2.));
  return ribbon*smoothstep(.27,.72,billow)*.43;
}
`;
