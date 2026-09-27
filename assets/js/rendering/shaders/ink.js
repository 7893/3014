import { noise } from "./common.js";
export const fragment = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_scene;
uniform vec2 u_size;
${noise}
void main(){
  vec2 pixel=1./u_size;
  vec3 color=texture(u_scene,v_uv).rgb;
  vec3 left=texture(u_scene,v_uv-pixel*vec2(.9,.25)).rgb;
  vec3 right=texture(u_scene,v_uv+pixel*vec2(.8,.4)).rgb;
  vec3 bleed=min(color,min(left,right));
  float fibre=noise(gl_FragCoord.xy*.34);
  color=mix(color,bleed,.13+fibre*.10);
  // Stationary paper grain: it never flickers with animation time.
  color+=vec3((hash(gl_FragCoord.xy)-.5)*.007);
  outColor=vec4(color,1.);
}
`;
