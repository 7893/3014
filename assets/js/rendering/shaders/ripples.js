// Inverse projection onto one horizontal water plane, shared by every scene.
export const ripples = `
vec2 waterPoint(vec2 p,float horizon){
  float depth=max(p.y-horizon,.008);
  return vec2((p.x-.5)*u_size.x/u_size.y,.85)/depth;
}
float touchRipple(vec2 p,float horizon,float sourceWater){
  float age=u_time-u_touch.z;
  if(age<0.||age>5.||u_touch.y<=horizon+.012||p.y<=horizon+.004)return 0.;
  if(sourceWater<.01)return 0.;
  float distance=length(waterPoint(p,horizon)-waterPoint(u_touch.xy,horizon));
  float radius=.035+age*.14;
  float front=distance-radius;
  float envelope=exp(-pow(front/.065,2.));
  float ring=sin(front*83.)*envelope;
  return ring*exp(-age*.9)*smoothstep(0.,.16,age)*sourceWater;
}
`;
