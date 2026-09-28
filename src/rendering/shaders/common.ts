export const vertex = `#version 300 es
in vec2 aPosition;
out vec2 v_uv;
void main(){v_uv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}
`;
export const noise = `
float hash(vec2 p){return fract(sin(dot(mod(p,256.),vec2(12.9898,78.233)))*437.585);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
float fbm(vec2 p){return noise(p)*.57+noise(p*2.03+7.1)*.29+noise(p*4.07-3.4)*.14;}
vec3 over(vec3 base,vec4 paint){return mix(base,paint.rgb,paint.a);}
vec4 sampleLayer(sampler2D source,vec2 p){if(any(lessThan(p,vec2(0)))||any(greaterThan(p,vec2(1))))return vec4(0);return texture(source,p);}
`;
