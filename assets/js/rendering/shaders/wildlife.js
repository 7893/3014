export const wildlife=`
vec3 paintSun(vec3 paper,vec2 p){
  float aspect=u_size.x/u_size.y;
  vec2 center=aspect<.85?vec2(.32,.12):vec2(.72,.205);
  float radius=min(aspect,1.)*.039;
  float r=length((p-center)*vec2(aspect,1.));
  float edge=radius+(noise(p*180.)-.5)*radius*.035;
  float disc=1.-smoothstep(edge-radius*.025,edge+radius*.025,r);
  float clouds=fbm(vec2(p.x*8.-u_time*.055,p.y*26.+u_time*.012));
  float haze=smoothstep(.29,.7,clouds);
  vec3 pigment=vec3(.64,.36,.23);
  return mix(paper,pigment,disc*(.24-haze*.15));
}
float fishInk(vec2 p,vec4 fish,float phase){
  vec2 q=(p-fish.xy)*vec2(u_size.x/u_size.y,1.);
  float c=cos(fish.z),s=sin(fish.z);
  q=mat2(c,-s,s,c)*q;
  float size=min(u_size.x/u_size.y,1.)*.027;
  q/=size;
  q.y-=sin(u_time*5.+phase-q.x*2.)*.11*(1.-smoothstep(-.65,.25,q.x));
  float body=1.-smoothstep(.90,1.07,length((q-vec2(.08,0.))/vec2(.58,.19)));
  float tailX=(-q.x-.40)/.53;
  float tail=smoothstep(0.,.12,tailX)*(1.-smoothstep(.85,1.,tailX));
  tail*=1.-smoothstep(.02,.08,abs(q.y)-tailX*.31);
  float fin=exp(-pow((q.x+.02)/.23,2.)-pow((abs(q.y)-.20)/.06,2.))*.36;
  return max(body,max(tail*.75,fin))*fish.w;
}
vec3 paintFish(vec3 color,vec2 p){
  if(p.y<.79||p.y>.97)return color;
  for(int i=0;i<3;i++) {
    vec4 fish=u_fish[i];
    float mark=fishInk(p,fish,float(i)*2.17);
    color=mix(color,vec3(.31,.37,.30),mark);
    // Surface rings remain where the fish touched the water, then fade away.
    vec4 ripple=u_fishRipples[i];
    vec2 d=(p-ripple.xy)*vec2(u_size.x/u_size.y,2.7);
    float radius=ripple.z*.014;
    float ring=exp(-pow((length(d)-radius)*620.,2.));
    float echo=exp(-pow((length(d)-radius*.65)*620.,2.))*.45;
    color-=vec3(.10,.115,.09)*(ring+echo)*ripple.w;
  }
  return color;
}
`;
