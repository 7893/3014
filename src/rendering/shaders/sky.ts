export const skyEffects = `
vec3 skyStars(vec2 p,vec2 pixels,float time,float density){
  // Stable sky positions, with pixel-sized cores on every screen.
  vec2 grid=vec2(26.*pixels.x/pixels.y,26.);
  vec2 cell=floor(p*grid);
  float seed=hash(cell+17.3);
  vec2 center=(cell+.18+.64*vec2(hash(cell+3.7),hash(cell+9.2)))/grid;
  vec2 delta=(p-center)*pixels;
  float radius=mix(.65,1.15,seed);
  float core=exp(-dot(delta,delta)/(radius*radius));
  float glow=exp(-dot(delta,delta)/20.)*.22;
  float twinkle=.22+1.05*pow(.5+.5*sin(time*(1.1+seed*.9)+seed*83.),1.4);
  float visible=step(density,seed)*(1.-smoothstep(.16,.48,p.y));
  return mix(vec3(.65,.79,1.),vec3(1.,.88,.65),seed)*(core+glow)*twinkle*visible;
}
float cloudLobe(vec2 q,vec2 center,vec2 size){
  return 1.-smoothstep(.72,1.08,length((q-center)/size));
}
float cloudBank(vec2 q){
  float cloud=cloudLobe(q,vec2(0.,.67),vec2(3.2,.59));
  cloud=max(cloud,cloudLobe(q,vec2(1.,.48),vec2(1.7,.50)));
  cloud=max(cloud,cloudLobe(q,vec2(-1.5,.62),vec2(1.7,.43)));
  return max(cloud,cloudLobe(q,vec2(-3.1,.85),vec2(2.,.25))*.73);
}
`;
