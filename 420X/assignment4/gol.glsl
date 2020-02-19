#ifdef GL_ES
precision mediump float;
precision highp int;
#endif

uniform vec2 resolution;

// simulation texture state, swapped each frame
uniform sampler2D state;
uniform float time;
uniform float speed;
uniform float blueFilledLevel;
uniform float greenFilledLevel;
uniform float redLevel;
uniform float blueNonLevel;
uniform float greenNonLevel;
uniform float minFilledBlue;
uniform float minFilledGreen;
uniform float minRed;
uniform float minNonBlue;
uniform float minNonGreen;
uniform bool blackAndWhite;
uniform int moveDistance;
uniform float degredationRate;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

// look up individual cell values 
vec4 get(int x, int y) {
  return texture2D( state, ( gl_FragCoord.xy + vec2(x, y) ) / resolution );
}

bool checkForAnt(vec4 pixel){
  return (pixel.r > 0.1 && pixel[3] < 1.);
}

bool floatEquals(float first, float second, float tolerance){
  return (abs(first - second) < tolerance);
}

vec4 drawDefault(vec4 current){
  if(current.r > .1){
    return vec4(min(current.r + degredationRate, 1.), min(current.g + degredationRate, 1.), min(current.b + degredationRate, 1.), current[3]);
  } else {
    return vec4(max(current.r - degredationRate, 0.), max(current.g - degredationRate, 0.), max(current.b - degredationRate, 0.), current[3]);
  }
}

void main() {
  vec4 current = get(0, 0);
  vec4 up = get(0, -1*moveDistance);
  vec4 down = get(0, moveDistance);
  vec4 left = get(-1*moveDistance, 0);
  vec4 right = get(moveDistance, 0);
  vec2 uv = gl_FragCoord.xy / resolution;
  float randFilledBlue = snoise3( vec3(uv.x*100., uv.y*100., time/50.) ) * (blueFilledLevel - minFilledBlue) + minFilledBlue;
  float randNonBlue = snoise3( vec3(uv.x*100., uv.y*100., time/37.) ) * (blueNonLevel - minNonBlue) + minNonBlue;
  float randFilledGreen = snoise3( vec3(uv.x*100., uv.y*100., time/25.) ) * (greenFilledLevel - minFilledGreen) + minFilledGreen ;
  float randNonGreen = snoise3( vec3(uv.x*100., uv.y*100., time/17.) ) * (greenNonLevel - minNonGreen) + minNonGreen;
  float randRed = snoise3( vec3(uv.x*100., uv.y*100., time/68.) ) * (redLevel - minRed) + minRed;
  //up is 1., down is .9, left is .8, right is .7, black is .9, white is .95
  
  if(checkForAnt(current)){ //If you are the ant, flip the current square
    if(blackAndWhite){
      if( floatEquals(current[3], .90, .01)){
          gl_FragColor = vec4(1., 1., 1., 1.);
      } else {
          gl_FragColor = vec4(0., 0., 0., 1.);
      }
    } else {
      if( floatEquals(current[3], .90, .01)){
          gl_FragColor = vec4(randRed, randFilledGreen, randFilledBlue, 1.);
      } else {
          gl_FragColor = vec4(0., randNonGreen, randNonBlue, 1.);
      }
    }
  } else if(checkForAnt(up)){ //If the ant is above you, check if it will turn into you and move it onto you if it is
    if( (floatEquals(up[3], .9, .01) && floatEquals(up[0], .8, .01)) || (floatEquals(up[3], .95, .01) && floatEquals(up[0], .7, .01)) ){
      if(current.r > 0.){
        gl_FragColor = vec4(.9, 0, .25, .95); //.5
      } else {
        gl_FragColor = vec4(.9, 0, .25, .90);
      }
    } else {
      gl_FragColor = current;
    }
  } else if(checkForAnt(down)){ //If the ant is below you, check if it will turn into you and move it onto you if it is
    if( (floatEquals(down[3], .9, .01) && floatEquals(down[0], .7, .01)) || (floatEquals(down[3], .95, .01) && floatEquals(down[0], .8, .01)) ){
      if(current.r > 0.){
        gl_FragColor = vec4(1., 0, 0., .95); //1.
      } else {
        gl_FragColor = vec4(1., 0, 0., .90);
      }
    } else {
      gl_FragColor = current;
    }
  } else if(checkForAnt(left)){ //If the ant is to the left of you, check if it will turn into you and move it onto you if it is
    if( (floatEquals(left[3], .9, .01) && floatEquals(left[0], .9, .01)) || (floatEquals(left[3], .95, .01) && floatEquals(left[0], 1., .01)) ){
      if(current.r > 0.){
        gl_FragColor = vec4(.7, 0., .75, .95); //.25
      } else {
        gl_FragColor = vec4(.7, 0., .75, .9);
      }
    } else {
      gl_FragColor = current;
    }
  } else if(checkForAnt(right)){ //If the ant is to the right of you, check if it will turn into you and move it onto you if it is
    if( (floatEquals(right[3], .9, .01) && floatEquals(right[0], 1., .01)) || (floatEquals(right[3], .95, .01) && floatEquals(right[0], .9, .01)) ){
      if(current.r > 0.){
        gl_FragColor = vec4(.8, 0., .5, .95); //0.
      } else {
        gl_FragColor = vec4(.8, 0., .5, .90);
      }
    } else {
      gl_FragColor = current;
    }
  } else { //If the ant isn't around you, don't do anything
    gl_FragColor = drawDefault(current);
  }

  if(!((mod(time, speed)) <  .1)){
    gl_FragColor = current;
  }
  // if (sum == 3) {
  //   // ideal # of neighbors... if cell is living, stay alive, if it is dead, come to life!
  //   gl_FragColor = vec4( 1. );
  // } else if (sum == 2) {
  //   // maintain current state
  //   float current = float( get(0, 0) );
  //   gl_FragColor = vec4( vec3( current ), 1.0 );
  // } else {
  //   // over-population or lonliness... cell dies
  //   gl_FragColor = vec4( vec3( 0.0 ), 1.0 );
  // }
  //gl_FragColor = vec4(0.,1.,0.,1.);
}