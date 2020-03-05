#version 300 es
precision mediump float;
in float a_posX;
in float a_posY;
in float a_movX;
in float a_movY;

uniform float time;
uniform vec2 resolution;
uniform float roll;
uniform float pitch;
uniform float azimuth;
uniform int compassCount;
uniform int compassTotal;
uniform float touchX;
uniform float touchY;
uniform int touchCount;
uniform int touchTotal;
uniform float pointSize;
uniform float maxSpeed;
uniform float maxForce;
const int particleCount = 1000;
uniform float alignDist; //Dist values are distance that boids can be from each other to factor into the force
uniform float cohesionDist;
uniform float separateWeight; //Weight values are amount that force affects final velocity
uniform float alignWeight;
uniform float cohesionWeight;
uniform float compassWeight;
uniform float touchWeight;
uniform float posXArr[particleCount];
uniform float posYArr[particleCount];
uniform float movXArr[particleCount];
uniform float movYArr[particleCount];


out float o_vposX;
out float o_vposY;
out float o_vmovX;
out float o_vmovY;
out float o_dist; //Distance to closest boid
out float o_dir; //Direction facing
out float o_speed; //Current speed
out float o_total; //Total neighbors

//Distance checking method that accounts for wraparound edges
float toroidalDistance (vec2 loc1, vec2 loc2){
  float dx = abs(loc2[0] - loc1[0]);
  float dy = abs(loc2[1] - loc1[1]);

  if (dx > resolution.x/2.)
      dx = resolution.x - dx;

  if (dy > resolution.y/2.)
      dy = resolution.y - dy;

  return sqrt(dx*dx + dy*dy);
}

//helper method to multiple both values in a vector by 1 number
vec2 vecMult(vec2 vector, float multVal){
  return vec2(vector[0] * multVal, vector[1] * multVal);
}

//helper method to divide both values in a vector by 1 number
vec2 vecDiv(vec2 vector, float divVal){
  return vec2(vector[0] / divVal, vector[1] / divVal);
}

//Implementation of PVectors "limit" function, used by the Nature of Code tutorial
vec2 limit(vec2 vector, float max){
  float magSq = vector[0]*vector[0] + vector[1]*vector[1];
  if(magSq > max*max){
    vec2 temp = normalize(vector);
    temp = vecMult(temp, max);
    return temp;
  } else {
    return vector;
  }
}

//Set magniture of vector to maxSpeed
vec2 setMag(vec2 vector){
  vec2 curVec = normalize(vector);
  return vecMult(curVec, maxSpeed);
}

//Calculate acceletarion to desired location
vec2 seek(vec2 loc, vec2 veloc, vec2 accel, vec2 targetLoc){
  vec2 desired = targetLoc - loc;
  desired = setMag(desired);

  desired = limit(desired-veloc, maxForce);
    
  return desired + accel;

}

//Method to implement separation force
vec2 separate(vec2 loc, vec2 veloc){
  float desiredSep = pointSize * 2.;
  vec2 sum = vec2(0,0);
  int total = 0;
  for(int i = 0; i < particleCount; i++){
    vec2 boidLoc = vec2(posXArr[i], posYArr[i]);
    float dist = toroidalDistance(loc, boidLoc);
    if(dist > .1 && dist < desiredSep){
      vec2 diff = loc - boidLoc;
      diff = normalize(diff);
      diff = vecDiv(diff, dist);
    
      sum = sum + diff;
      ++total;  
    }
  }

  if(total > 0){
    sum = vecDiv(sum, float(total));
    sum = setMag(sum);
    sum = limit(sum-veloc, maxForce);
    return sum;
  } else {
    return vec2(0,0);
  }
}

//method to implement alignment force
vec2 align(vec2 loc, vec2 veloc){
  vec2 sum = vec2(0,0);
  int total = 0;
  o_dist = length(vec2(resolution.x, resolution.y));
  for(int i = 0; i < particleCount; i++){
    vec2 boidLoc = vec2(posXArr[i], posYArr[i]);
    float dist = toroidalDistance(loc, boidLoc);
    if(dist > .1 && dist < alignDist){
      sum[0] = sum[0] + movXArr[i];
      sum[1] = sum[1] + movYArr[i];
      ++total;  
    }

    if(dist > 100. && dist < o_dist){
      o_dist = dist;
    }
  }

  o_total = float(total);

  if(total > 0){
    sum = vecDiv(sum, float(total));

    sum = setMag(sum);
    sum = limit(sum-veloc, maxForce);
    return sum;
  } else {
    return vec2(0,0);
  }
}

//method to implement cohesion force
vec2 cohesion(vec2 loc, vec2 veloc, vec2 accel){
  vec2 sum = vec2(0,0);
  int total = 0;
  for(int i = 0; i < particleCount; i++){
    vec2 boidLoc = vec2(posXArr[i], posYArr[i]);
    float dist = toroidalDistance(loc, boidLoc);
    if(dist > .1 && dist < cohesionDist){
      sum[0] = sum[0] + boidLoc[0];
      sum[1] = sum[1] + boidLoc[1];
      ++total;  
    }
  }
  
  if(total > 0){
    sum = vecDiv(sum, float(total));
    return seek(loc, veloc, accel, sum);
  } else {
    return vec2(0,0);
  }
}

//Convert positions from pixels to -1,1 scale
vec2 resConv(vec2 pos){
  float resX = resolution.x/2.;
  float resY = resolution.y/2.;
    
  return vec2((pos[0]-resX)/resX, (pos[1]-resY)/resY);
}

//Method to convert compass values into velocity. Looked worse than the current position version,
//so it's unused
// vec2 compSpeed(vec2 veloc){
//   vec2 convForce = vec2(0., 0.);

//   if(roll >= 0.){
//     convForce[0] = ((roll+1.)/120.);
//   } else {
//     convForce[0] = (roll/116.);
//   }

//   if(pitch >= 0.){
//     convForce[1] = ((pitch+1.)/120.);
//   } else {
//     convForce[1] = (pitch/116.);  
//   }

//   vecMult(convForce, maxSpeed);
//   convForce = limit(convForce-veloc, maxSpeed);
    
//   return convForce;
// }

//Change resulting compass acceleration into appropriate signs
vec2 compConv(vec2 curAccel, float roll, float pitch){
  vec2 temp = curAccel;
  if(roll < 0.){
    temp[0] = curAccel[0] * -1.;
  }

  if(pitch < 0.){
    temp[1] = curAccel[1] * -1.;
  }

  return temp;
}


void main() {
  o_dist = 0.;
  vec2 veloc = vec2(0,0);

  //Check to see if shaders should be updated this iteration, currently unused because of implementation difficulties
  if(((mod(time, 1.)) <  .1)){
    vec2 loc = vec2(a_posX, a_posY);
    veloc = vec2(a_movX, a_movY);
    vec2 accel = vec2(0., 0.);

    vec2 sep = separate(loc, veloc);
    vec2 align = align(loc, veloc);
    vec2 coh = cohesion(loc, veloc, accel);

    //calculate forces
    sep = vecMult(sep, separateWeight);
    align = vecMult(align, alignWeight);
    coh = vecMult(coh, cohesionWeight);

    //Calculate and add compass force if the last compass message was within "compassTotal" time steps
    if(compassCount < compassTotal){
      float convRoll = roll * 50.;
      float convPitch = pitch * 50.;
      vec2 comp = seek(loc, veloc, accel, vec2(abs(convRoll), abs(convPitch)));
      comp = compConv(comp, convRoll, convPitch);
      comp = vecMult(comp, compassWeight);
      accel += comp;
    }

    //Calculate and add touch force if the last compass message was within "touchTotal" time steps
    if(touchCount < touchTotal){
      vec2 touch = seek(loc, veloc, accel, vec2(touchX*resolution.x, touchY*resolution.y));
      touch = vecMult(touch, touchWeight);
      accel += touch;
    }

    //Add forces to acceleration
    accel += sep;
    accel += align;
    accel += coh;

    //update Pos
    veloc = min(veloc + accel, maxSpeed);
    loc = veloc + loc;
    veloc = vec2(veloc[0], veloc[1]);

    //wrap boids around if necessary
    loc = vec2(loc[0], loc[1]);
    if(loc[0] > resolution.x){
      loc[0] = loc[0] - resolution.x;
    } else if(loc[0] < 0.){
      loc[0] = loc[0] + resolution.x;
    }

    if(loc[1] > resolution.y){
      loc[1] = loc[1] - resolution.y;
    } else if(loc[1] < 0.){
      loc[1] = loc[1] + resolution.y;
    }

    o_vposX =loc[0];
    o_vposY =loc[1];
    o_vmovX = veloc[0];
    o_vmovY = veloc[1];

  } else {
    o_vposX = a_posX;
    o_vposY = a_posY;
    o_vmovX = a_movX;
    o_vmovY = a_movY;

  }

  o_dir = degrees(atan(veloc[1], veloc[0])) + 180.;
  o_speed = length(veloc);
  gl_PointSize = pointSize;
    
  vec2 convertedPos = resConv(vec2(o_vposX, o_vposY));

  gl_Position = vec4(convertedPos[0], convertedPos[1], 0., 1.);
  
}