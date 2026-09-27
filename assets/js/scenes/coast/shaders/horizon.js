export const horizon = `
vec3 paintIslands(vec3 sky,vec2 p){
  vec3 haze=vec3(.70,.77,.69);
  for(int i=0;i<3;i++){
    float f=float(i),x=p.x+f*.055;
    float mass=exp(-pow((x-.95)*4.7,2.));
    float ridge=.479-mass*(.075-f*.017);
    ridge-=mass*(noise(vec2(x*19.+f*9.,f))* .018+noise(vec2(x*47.,f+2.))*.004);
    float edge=smoothstep(ridge-.0018,ridge+.0025,p.y);
    float base=smoothstep(.415,.48,p.y);
    float fold=fbm(vec2(x*23.+p.y*11.,p.y*24.+f*7.));
    vec3 pigment=mix(vec3(.33,.49,.46),vec3(.48,.61,.53),fold);
    pigment=mix(pigment,haze,.52-f*.15+base*.24);
    sky=mix(sky,pigment,edge*(1.-smoothstep(.476,.482,p.y)));
  }
  return sky;
}
`;
