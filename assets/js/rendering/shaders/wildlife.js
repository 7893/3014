export const wildlife = `
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
    vec4 ripple=u_fishRipples[i];
    float jump=step(ripple.z,1.1)*step(float(i),.5);
    float arc=sin(clamp(ripple.z/1.1,0.,1.)*3.14159);
    fish.y-=arc*.037*jump;
    fish.z-=sin(ripple.z/1.1*6.28318)*.65*jump;
    fish.w=mix(fish.w,.87,jump*arc);
    float mark=fishInk(p,fish,float(i)*2.17);
    color=mix(color,vec3(.31,.37,.30),mark);
    // Surface rings remain where the fish touched the water, then fade away.
    vec2 d=(p-ripple.xy)*vec2(u_size.x/u_size.y,2.7);
    float radius=ripple.z*.014;
    float ring=exp(-pow((length(d)-radius)*620.,2.));
    float echo=exp(-pow((length(d)-radius*.65)*620.,2.))*.45;
    if(i>0)color-=vec3(.10,.115,.09)*(ring+echo)*ripple.w;
    // A landing splash follows the airborne fish; rings spread in perspective.
    if(i==0){
      float age=ripple.z-1.1;
      float radius=max(age,0.)*.025;
      float landing=exp(-pow((length(d)-radius)*620.,2.));
      color-=vec3(.14,.16,.12)*landing*exp(-max(age,0.)*1.4)*step(0.,age);
      for(int j=0;j<5;j++){
        float f=float(j),t=clamp(age,0.,.75);
        vec2 center=ripple.xy+vec2((f-2.)*t*.011,-sin(t/.75*3.14159)*(.013+mod(f,2.)*.008));
        vec2 drop=(p-center)*u_size;
        float splash=exp(-dot(drop,drop)/1.8)*step(0.,age)*(1.-step(.75,age));
        color=mix(color,vec3(.95,.94,.85),splash*.8);
      }
    }
  }
  return color;
}
`;
