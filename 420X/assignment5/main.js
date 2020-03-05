const glslify = require( 'glslify' )
const dat = require('dat.gui')
// "global" variables
let gl, uTime, positionX, positionY, posXBuffer1, posXBuffer2, posYBuffer1, posYBuffer2, uPosXArr, uPosYArr;
let movementX, movementY, movXBuffer1, movXBuffer2, movYBuffer1, movYBuffer2, uMovXArr, uMovYArr, uParticleCount;
let uRoll, uPitch, uAzimuth, uCompassCount, uTouchCount, uCompassTotal, uTouchTotal, uTouchX, uTouchY;
let uPointSize, uMaxSpeed, uMaxForce, uAlignDist, uCohesionDist, uSeparateWeight, uAlignWeight, uCohesionWeight, uCompassWeight, uTouchWeight, uBlackAndWhite; 
let compassCount = 50;
let touchCount = 50;
let particleCount = 1000;

let FizzyText = function() {
  this.pointSize = 10;
  this.maxSpeed = 4;
  this.maxForce = .1;
  this.alignDist = 50;
  this.cohesionDist = 50;
  this.separateWeight = 1.5;
  this.alignWeight = 1.;
  this.cohesionWeight = 1.;
  this.compassWeight = 1.;
  this.touchWeight = 1.;
  this.compassTotal = 50;
  this.touchTotal = 50;
  this.playPause = true;
  this.blackAndWhite = false;
};

//Parse messages for below values
let roll = 0, pitch = 0, azimuth = 0, touchX = 0, touchY = 0;
const ws = new WebSocket('ws://127.0.0.1:8080')
ws.onmessage = function(msg) { 
  const json = JSON.parse(msg.data)
  if(json.address === '/orientation/roll'){
    compassCount = 0;
    roll = Math.ceil(json.args[0].value)
  } else if (json.address === '/orientation/pitch'){
    compassCount = 0;
    pitch = Math.ceil(json.args[0].value)
  } else if(json.address === '/orientation/azimuth'){
    compassCount = 0;
    azimuth = Math.ceil(json.args[0].value)
  } else if(json.address === '/oscControl/touchX'){
    touchCount = 0;
    touchX = json.args[0].value
  } else if(json.address === '/oscControl/touchY'){
    touchCount = 0;
    touchY = json.args[0].value
  }
}

window.onload = function() {
  text = new FizzyText();
  let gui = new dat.GUI();
  gui.add(text, 'pointSize', 1, 200, 1);
  gui.add(text, 'maxSpeed', 0., 100.);
  gui.add(text, 'maxForce', 0., 10.);
  gui.add(text, 'alignDist', 1., window.innerWidth);
  gui.add(text, 'cohesionDist', 1., window.innerWidth);
  gui.add(text, 'separateWeight', 0., 100.);
  gui.add(text, 'alignWeight', 0., 100.);
  gui.add(text, 'cohesionWeight', 0., 100.);
  gui.add(text, 'compassWeight', 0., 100.);
  gui.add(text, 'touchWeight', 0., 100.);
  gui.add(text, 'compassTotal', 1., 10000.)
  gui.add(text, 'touchTotal', 1., 10000.)
  gui.add(text, 'playPause')
  gui.add(text, 'blackAndWhite')
  
  const canvas = document.getElementById( 'gl' )
  gl = canvas.getContext( 'webgl2' )
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // define drawing area of canvas. bottom corner, width / height
  gl.viewport( 0,0,gl.drawingBufferWidth, gl.drawingBufferHeight )

  //define 4 arrays, one per value needed. Done with 4 rather than 1 because webgl limits Float32Array size to 512,
  //so increasing the number of arrays increases the number of particles. Seems that 4 arrays provides no benefits however, as
  //both a 2 array version and a 4 array version I implemented max out at the same number of particles
  const posXData = new Float32Array( particleCount )
  for( let i = 0; i < particleCount; i++) {
    posXData[ i ] = Math.random() * gl.drawingBufferWidth;
  }

  const posYData = new Float32Array( particleCount )
  for( let i = 0; i < particleCount; i++) {
    posYData[ i ] = Math.random() * gl.drawingBufferHeight;
  }

  const movXData = new Float32Array( particleCount )
  for( let i = 0; i < particleCount; i++) {
    movXData[ i ] = 0
  }

  const movYData = new Float32Array( particleCount )
  for( let i = 0; i < particleCount; i++) {
    movYData[ i ] = 0
  }

  // create a buffer object to store vertices
  posXBuffer1 = gl.createBuffer()
  posXBuffer2 = gl.createBuffer()
  posYBuffer1 = gl.createBuffer()
  posYBuffer2 = gl.createBuffer()
  movXBuffer1 = gl.createBuffer()
  movXBuffer2 = gl.createBuffer()
  movYBuffer1 = gl.createBuffer()
  movYBuffer2 = gl.createBuffer()


  // point buffer at graphic context's ARRAY_BUFFER
  gl.bindBuffer( gl.ARRAY_BUFFER, posXBuffer1 )
  // we will be constantly updating this buffer data
  gl.bufferData( gl.ARRAY_BUFFER, posXData, gl.DYNAMIC_COPY )

  gl.bindBuffer( gl.ARRAY_BUFFER, posXBuffer2 )
  // each number with 4 bytes (32 bits)
  gl.bufferData( gl.ARRAY_BUFFER, particleCount * 4, gl.DYNAMIC_COPY )

  // point buffer at graphic context's ARRAY_BUFFER
  gl.bindBuffer( gl.ARRAY_BUFFER, posYBuffer1 )
  // we will be constantly updating this buffer data
  gl.bufferData( gl.ARRAY_BUFFER, posYData, gl.DYNAMIC_COPY )

  gl.bindBuffer( gl.ARRAY_BUFFER, posYBuffer2 )
  // each number with 4 bytes (32 bits)
  gl.bufferData( gl.ARRAY_BUFFER, particleCount  * 4, gl.DYNAMIC_COPY )


  // point buffer at graphic context's ARRAY_BUFFER
  gl.bindBuffer( gl.ARRAY_BUFFER, movXBuffer1 )
  // we will be constantly updating this buffer data
  gl.bufferData( gl.ARRAY_BUFFER, movXData, gl.DYNAMIC_COPY )

  // point buffer at graphic context's ARRAY_BUFFER
  gl.bindBuffer( gl.ARRAY_BUFFER, movXBuffer2 )
  // each number with 4 bytes (32 bits)
  gl.bufferData( gl.ARRAY_BUFFER, particleCount * 4, gl.DYNAMIC_COPY )

  // point buffer at graphic context's ARRAY_BUFFER
  gl.bindBuffer( gl.ARRAY_BUFFER, movYBuffer1 )
  // we will be constantly updating this buffer data
  gl.bufferData( gl.ARRAY_BUFFER, movYData, gl.DYNAMIC_COPY )

  // point buffer at graphic context's ARRAY_BUFFER
  gl.bindBuffer( gl.ARRAY_BUFFER, movYBuffer2 )
  // each number with 4 bytes (32 bits)
  gl.bufferData( gl.ARRAY_BUFFER, particleCount * 4, gl.DYNAMIC_COPY )

  // create vertex shader
  let shaderSource =  glslify.file( './vert.glsl' )
  const vertexShader = gl.createShader( gl.VERTEX_SHADER )
  gl.shaderSource( vertexShader, shaderSource );
  gl.compileShader( vertexShader )
  console.log(gl.getShaderInfoLog(vertexShader))

  // create fragment shader
  shaderSource = glslify.file( './frag.glsl' )
  const fragmentShader = gl.createShader( gl.FRAGMENT_SHADER )
  gl.shaderSource( fragmentShader, shaderSource );
  gl.compileShader( fragmentShader )
  console.log(gl.getShaderInfoLog(fragmentShader))

  

  // create shader program
  const program = gl.createProgram()
  gl.attachShader( program, vertexShader )
  gl.attachShader( program, fragmentShader )
  transformFeedback = gl.createTransformFeedback()
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback)
  gl.transformFeedbackVaryings( program, ['o_vposX', 'o_vposY', 'o_vmovX', 'o_vmovY'], gl.SEPARATE_ATTRIBS )
  gl.linkProgram( program )
  gl.useProgram( program )
  
  /* ALL ATTRIBUTE/UNIFORM INITIALIZATION MUST COME AFTER 
  CREATING/LINKING/USING THE SHADER PROGAM */
  
  // find a pointer to the uniform "time" in our fragment shader
  uTime = gl.getUniformLocation( program, 'time' ) 
  const uRes = gl.getUniformLocation( program, 'resolution' )
  uRoll = gl.getUniformLocation( program, 'roll' )
  uPitch = gl.getUniformLocation( program, 'pitch' )
  uAzimuth = gl.getUniformLocation( program, 'azimuth' )
  uTouchX = gl.getUniformLocation( program, 'touchX' )
  uTouchY = gl.getUniformLocation( program, 'touchY' )
  uCompassCount = gl.getUniformLocation( program, 'compassCount' )
  uTouchCount = gl.getUniformLocation( program, 'touchCount' )
  uCompassTotal = gl.getUniformLocation( program, 'compassTotal' )
  uTouchTotal = gl.getUniformLocation( program, 'touchTotal' )
  uParticleTotal = gl.getUniformLocation( program, 'particleTotal' )
  uPosXArr = gl.getUniformLocation( program, 'posXArr' )
  uPosYArr = gl.getUniformLocation( program, 'posYArr' )
  uMovXArr = gl.getUniformLocation( program, 'movXArr' )
  uMovYArr = gl.getUniformLocation( program, 'movYArr' )
  uPointSize = gl.getUniformLocation( program, 'pointSize' )
  uMaxSpeed = gl.getUniformLocation( program, 'maxSpeed' )
  uMaxForce = gl.getUniformLocation( program, 'maxForce' )
  uAlignDist = gl.getUniformLocation( program, 'alignDist' )
  uCohesionDist = gl.getUniformLocation( program, 'cohesionDist' )
  uSeparateWeight = gl.getUniformLocation( program, 'separateWeight' )
  uAlignWeight = gl.getUniformLocation( program, 'alignWeight' )
  uCohesionWeight = gl.getUniformLocation( program, 'cohesionWeight' )
  uCompassWeight = gl.getUniformLocation( program, 'compassWeight' )
  uTouchWeight = gl.getUniformLocation( program, 'touchWeight' )
  uBlackAndWhite = gl.getUniformLocation( program, 'blackAndWhite' )
  
  
  
  
  
  // uExtraArr = gl.getUniformLocation( program, 'extraArr' )
  gl.uniform2f( uRes, window.innerWidth, window.innerHeight )

  // get position attribute location in shader
  gl.bindBuffer( gl.ARRAY_BUFFER, posXBuffer1 )
  positionX = gl.getAttribLocation( program, 'a_posX' )
  gl.vertexAttribPointer( positionX, 1, gl.FLOAT, false, 0,0 )
  gl.enableVertexAttribArray( positionX )
  
  // get position attribute location in shader
  gl.bindBuffer( gl.ARRAY_BUFFER, posYBuffer1 )
  positionY = gl.getAttribLocation( program, 'a_posY' )
  gl.vertexAttribPointer( positionY, 1, gl.FLOAT, false, 0,0 )
  gl.enableVertexAttribArray( positionY )
  
  // get movement attribute location in shader
  gl.bindBuffer( gl.ARRAY_BUFFER, movXBuffer1 )
  movementX = gl.getAttribLocation( program, 'a_movX' )
  gl.vertexAttribPointer( movementX, 1, gl.FLOAT, false, 0,0 )
  gl.enableVertexAttribArray( movementX )
  
  // get movement attribute location in shader
  gl.bindBuffer( gl.ARRAY_BUFFER, movYBuffer1 )
  movementY = gl.getAttribLocation(program, 'a_movY' )
  gl.vertexAttribPointer( movementY, 1, gl.FLOAT, false, 0,0 )
  gl.enableVertexAttribArray( movementY )

  // enable the attribute
  // this will point to the vertices in the last bound array buffer.
  // In this example, we only use one array buffer, where we're storing 
  // our vertices
  
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

  render()
}

// keep track of time via incremental frame counter
let time = 0
function render() {
  window.requestAnimationFrame( render )
  if(text.playPause){
    // schedules render to be called the next time the video card requests 
    // a frame of video
    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // update time on CPU and GPU
    time++
    compassCount++
    touchCount++
    gl.uniform1f( uTime, time )
    gl.uniform1i(uParticleCount, particleCount )      
    gl.uniform1f( uRoll, roll )
    gl.uniform1f( uPitch, pitch )
    gl.uniform1f( uAzimuth, azimuth )
    gl.uniform1f( uTouchX, touchX )
    gl.uniform1f( uTouchY, touchY )
    gl.uniform1f( uPointSize, text.pointSize )
    gl.uniform1f( uMaxSpeed, text.maxSpeed )
    gl.uniform1f( uMaxForce, text.maxForce )
    gl.uniform1f( uAlignDist, text.alignDist )
    gl.uniform1f( uCohesionDist, text.cohesionDist )
    gl.uniform1f( uSeparateWeight, text.separateWeight )
    gl.uniform1f( uAlignWeight, text.alignWeight )
    gl.uniform1f( uCohesionWeight, text.cohesionWeight )
    gl.uniform1f( uCompassWeight, text.compassWeight )
    gl.uniform1f( uTouchWeight, text.touchWeight )
    gl.uniform1i( uBlackAndWhite, text.blackAndWhite )
    
    gl.uniform1i(uCompassCount, compassCount)      
    gl.uniform1i(uTouchCount, touchCount)      
    gl.uniform1i(uCompassTotal, text.compassTotal)      
    gl.uniform1i(uTouchTotal, text.touchTotal)      
    
    gl.bindBufferBase( gl.TRANSFORM_FEEDBACK_BUFFER, 0, posXBuffer2 )
    gl.bindBufferBase( gl.TRANSFORM_FEEDBACK_BUFFER, 1, posYBuffer2 )  
    gl.bindBufferBase( gl.TRANSFORM_FEEDBACK_BUFFER, 2, movXBuffer2 )
    gl.bindBufferBase( gl.TRANSFORM_FEEDBACK_BUFFER, 3, movYBuffer2 )  
    

    gl.bindBuffer( gl.ARRAY_BUFFER, posXBuffer1 )
    let posXArr = new Float32Array( particleCount )
    gl.getBufferSubData(gl.ARRAY_BUFFER, 0, posXArr, 0,  particleCount )
    gl.vertexAttribPointer( positionX, 1, gl.FLOAT, false, 0,0 )

    gl.bindBuffer( gl.ARRAY_BUFFER, posYBuffer1 )
    let posYArr = new Float32Array( particleCount )
    gl.getBufferSubData(gl.ARRAY_BUFFER, 0, posYArr, 0,  particleCount )
    gl.vertexAttribPointer( positionY, 1, gl.FLOAT, false, 0,0 )

    gl.bindBuffer( gl.ARRAY_BUFFER, movXBuffer1 )
    let movXArr = new Float32Array( particleCount )
    gl.getBufferSubData(gl.ARRAY_BUFFER, 0, movXArr, 0,  particleCount )  
    gl.vertexAttribPointer( movementX, 1, gl.FLOAT, false, 0,0 )

    gl.bindBuffer( gl.ARRAY_BUFFER, movYBuffer1 )
    let movYArr = new Float32Array( particleCount )
    gl.getBufferSubData(gl.ARRAY_BUFFER, 0, movYArr, 0,  particleCount )  
    gl.vertexAttribPointer( movementY, 1, gl.FLOAT, false, 0,0 )

    gl.uniform1fv(uPosXArr, posXArr)
    gl.uniform1fv(uPosYArr, posYArr)
    gl.uniform1fv(uMovXArr, movXArr)
    gl.uniform1fv(uMovYArr, movYArr)

    gl.beginTransformFeedback( gl.POINTS )
    gl.drawArrays( gl.POINTS, 0, particleCount  )
    gl.endTransformFeedback()
    gl.flush()
    
    gl.bindBufferBase( gl.TRANSFORM_FEEDBACK_BUFFER, 0, null );
    
    let tmpX1 = posXBuffer1;  posXBuffer1 = posXBuffer2;  posXBuffer2 = tmpX1;
    let tmpY1 = posYBuffer1;  posYBuffer1 = posYBuffer2;  posYBuffer2 = tmpY1;
    let tmpX2 = movXBuffer1;  movXBuffer1 = movXBuffer2;  movXBuffer2 = tmpX2;
    let tmpY2 = movYBuffer1;  movYBuffer1 = movYBuffer2;  movYBuffer2 = tmpY2;
  }
}