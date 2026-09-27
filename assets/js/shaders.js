export const vertex = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() { v_uv=a_position*.5+.5; gl_Position=vec4(a_position,0.,1.); }
`;
export const fragment = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_painting;
uniform vec2 u_size;
uniform float u_time;
uniform vec3 u_touch;
float hash(vec2 p) { return fract(sin(dot(mod(p,256.),vec2(12.9898,78.233)))*437.585); }
float noise(vec2 p) {
  vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);
}
void main() {
  vec2 uv=v_uv; vec2 p=vec2(uv.x,1.-uv.y);
  float river=smoothstep(.725,.80,p.y)*(1.-smoothstep(.91,.97,p.y))*smoothstep(.34,.53,p.x);
  float flow=sin(p.y*175.+u_time*.48+p.x*13.)*.36+sin(p.y*310.-u_time*.32)*.16;
  uv.x+=flow*river*.0007;
  uv.y+=sin(p.x*42.+p.y*180.-u_time*.45)*river*.00010;
  float age=u_time-u_touch.z;
  vec2 delta=(p-u_touch.xy)*vec2(u_size.x/u_size.y,1.);
  float distance=length(delta);
  float ripple=sin(distance*145.-age*4.)*exp(-distance*9.)*exp(-max(age,0.)*.85)*step(0.,age);
  uv+=normalize(delta+vec2(.0001))*ripple*river*.0008;
  vec3 paper=vec3(.941,.923,.871);
  vec3 color=texture2D(u_painting,uv).rgb;
  // A little capillary bleeding at ink edges; the original brush marks remain crisp.
  vec2 pixel=1./u_size;
  vec3 neighbor=texture2D(u_painting,uv+pixel*vec2(.7,.4)).rgb;
  color=mix(color,min(color,neighbor),.10);
  float light=dot(color,vec3(.299,.587,.114));
  float fog=noise(vec2(p.x*5.-u_time*.009,p.y*18.+u_time*.003));
  float veil=smoothstep(.50,.62,p.y)*(1.-smoothstep(.70,.77,p.y));
  color=mix(color,paper,veil*smoothstep(.40,.77,fog)*.055*smoothstep(.4,.75,light));
  color+=vec3((hash(gl_FragCoord.xy)-.5)*.008);
  gl_FragColor=vec4(color,1.);
}
`;
