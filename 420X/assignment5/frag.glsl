#version 300 es
precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform bool blackAndWhite;
in float o_dist;
in float o_speed;
in float o_total;
in float o_dir;

// in vec4 gl_FragCoord;

out vec4 o_frag;

void main() {
  //float distAvg = o_dist/(length(vec2(resolution.x, resolution.y))/5.);
  float totalAvg = max(o_total/15., .2);
  float speedAvg = o_speed/4.;
  float dirAvg = o_dir/360.;
  float xVal = gl_FragCoord[0]/resolution.x;
  float yVal = gl_FragCoord[1]/resolution.y;

  float rVal = 1.-speedAvg;
  float gVal = speedAvg;
  float bVal = dirAvg;
  
  //Options to change color in a poor approximation of rgb, unused because current way looks better
  //float timeMod = mod(time, 300.);
  // if(timeMod > 250.){
  //   rVal = speedAvg;
  //   bVal = (timeMod-200.)/100.;
  //   gVal = 1.-((timeMod-200.)/100.);

  // } else if(timeMod > 200.){
  //   rVal = speedAvg;
  //   bVal = 1.-((timeMod-200.)/100.);
  //   gVal = (timeMod-200.)/100.;

  // } else if(timeMod > 150.){
  //   rVal = (timeMod-100.)/100.;
  //   bVal = speedAvg;
  //   gVal = 1.-((timeMod-100.)/100.);

  // } else if(timeMod > 100.){
  //   rVal = 1.-((timeMod-100.)/100.);
  //   bVal = speedAvg;
  //   gVal = (timeMod-100.)/100.;

  // } else if(timeMod > 50.){
  //   rVal = 1.-((timeMod-0.)/100.);
  //   bVal = (timeMod-0.)/100.;
  //   gVal = speedAvg;

  // } else if(timeMod > 0.){
  //   rVal = (timeMod-0.)/100.;
  //   bVal = 1.-((timeMod-0.)/100.);
  //   gVal = speedAvg;

  // }

  if(blackAndWhite){
    o_frag = vec4(1., 1., 1., 1.);
  } else {
    o_frag = vec4(rVal, gVal, bVal, totalAvg);
  }
}