const glslify = require('glslify')
const toy     = require('gl-toy')
const fbo     = require('gl-fbo')
const fillScreen = require('a-big-triangle')
const createShader = require('gl-shader')
const dat = require('dat.gui')

const draw = glslify('./draw.glsl')
      vert = glslify.file('./vert.glsl'),
      gol  = glslify.file('./gol.glsl')

let   initialized = 1,
      sim = null
let delay = 10;
let flag = 0;
let recolor = false;
let state = []

let text = null;
let controllerStruct = {};

var FizzyText = function() {
  this.message = 'Alex Osler Ants';
  this.intervalDelay = 10;
  this.resolution = 10;
  this.redLevel = 0.
  this.blueLevel = 0.;
  this.greenLevel = 0.;
  this.minRed = .1;
  this.minBlue = .25;
  this.minGreen = .75;
  this.degredationRate = .0;
  this.blueFilledLevel = 0.;
  this.greenFilledLevel = 0.;
  this.blueNonLevel = 0.;
  this.greenNonLevel = 0.;
  this.minFilledBlue = 0.;
  this.minFilledGreen = 0.;
  this.minNonBlue = 0.;
  this.minNonGreen = 0.;
  this.antChance = .3;
  this.moveDistance = 1;
  this.allWhite = false;
  this.playPause = true;
  this.blackAndWhite = false;
};

window.onload = function() {
  text = new FizzyText();
  var gui = new dat.GUI();
  gui.add(text, 'message');
  gui.add(text, 'intervalDelay', 1, 100, 1);
  gui.add(text, 'resolution', 1, 10, 1);
  gui.add(text, 'redLevel', 0., 1.);
  gui.add(text, 'blueLevel', 0., 1.);
  gui.add(text, 'greenLevel', 0., 1.);
  gui.add(text, 'minRed', .1, 1.);
  gui.add(text, 'minBlue', 0., 1.);
  gui.add(text, 'minGreen', 0., 1.);
  gui.add(text, 'degredationRate', 0., 1.);
  gui.add(text, 'blueFilledLevel', 0., 1.);
  gui.add(text, 'greenFilledLevel', 0., 1.);
  gui.add(text, 'blueNonLevel', 0., 1.);
  gui.add(text, 'greenNonLevel', 0., 1.);
  gui.add(text, 'minFilledBlue', 0., 1.);
  gui.add(text, 'minFilledGreen', 0., 1.);
  gui.add(text, 'minNonBlue', 0., 1.);
  gui.add(text, 'minNonGreen', 0., 1.);
  gui.add(text, 'antChance', 0., 1.);
  gui.add(text, 'moveDistance', 1, 20, 1);
  gui.add(text, 'playPause');
  gui.add(text, 'allWhite');
  gui.add(text, 'blackAndWhite')

  for(let i = 0; i < gui.__controllers.length; i++){
    let curController = gui.__controllers[i];
    controllerStruct[curController.property] = curController;
  }



  controllerStruct['resolution'].onChange(function(){
    deInitialize();
  })

  controllerStruct['antChance'].onChange(function(){
    recolor = true;
  })

  controllerStruct['allWhite'].onChange(function(){
    recolor = true;
  })

  let curBlue = controllerStruct['blueLevel'].getValue();
  controllerStruct['blueFilledLevel'].setValue(curBlue);
  controllerStruct['blueFilledLevel'].updateDisplay();
  controllerStruct['blueNonLevel'].setValue(curBlue);
  controllerStruct['blueNonLevel'].updateDisplay();

  controllerStruct['blueLevel'].onFinishChange(function(){
    let curBlue = controllerStruct['blueLevel'].getValue();
    controllerStruct['blueFilledLevel'].setValue(curBlue);
    controllerStruct['blueFilledLevel'].updateDisplay();
    controllerStruct['blueNonLevel'].setValue(curBlue);
    controllerStruct['blueNonLevel'].updateDisplay();
  })

  let curgreen = controllerStruct['greenLevel'].getValue();
  controllerStruct['greenFilledLevel'].setValue(curgreen);
  controllerStruct['greenFilledLevel'].updateDisplay();
  controllerStruct['greenNonLevel'].setValue(curgreen);
  controllerStruct['greenNonLevel'].updateDisplay();

  controllerStruct['greenLevel'].onFinishChange(function(){
    let curgreen = controllerStruct['greenLevel'].getValue();
    controllerStruct['greenFilledLevel'].setValue(curgreen);
    controllerStruct['greenFilledLevel'].updateDisplay();
    controllerStruct['greenNonLevel'].setValue(curgreen);
    controllerStruct['greenNonLevel'].updateDisplay();
  })

  curblue = controllerStruct['minBlue'].getValue();
  controllerStruct['minFilledBlue'].setValue(curblue);
  controllerStruct['minFilledBlue'].updateDisplay();
  controllerStruct['minNonBlue'].setValue(curblue);
  controllerStruct['minNonBlue'].updateDisplay();

  controllerStruct['minBlue'].onFinishChange(function(){
    let curblue = controllerStruct['minBlue'].getValue();
    controllerStruct['minFilledBlue'].setValue(curblue);
    controllerStruct['minFilledBlue'].updateDisplay();
    controllerStruct['minNonBlue'].setValue(curblue);
    controllerStruct['minNonBlue'].updateDisplay();
  })

  curgreen = controllerStruct['minGreen'].getValue();
  controllerStruct['minFilledGreen'].setValue(curgreen);
  controllerStruct['minFilledGreen'].updateDisplay();
  controllerStruct['minNonGreen'].setValue(curgreen);
  controllerStruct['minNonGreen'].updateDisplay();

  controllerStruct['minGreen'].onFinishChange(function(){
    let curgreen = controllerStruct['minGreen'].getValue();
    controllerStruct['minFilledGreen'].setValue(curgreen);
    controllerStruct['minFilledGreen'].updateDisplay();
    controllerStruct['minNonGreen'].setValue(curgreen);
    controllerStruct['minNonGreen'].updateDisplay();
  })
  
};

function poke( x, y, r, g, b, alpha, texture ) {  
  const gl = texture.gl
  texture.bind()
  
  gl.texSubImage2D( 
    gl.TEXTURE_2D, 0, 
    x, y, 1, 1,
    gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([ r,g,b, alpha ])
  )
}

function setInitialState( width, height, tex ) {
  for( i = 0; i < width; i++ ) {
    for( j = 0; j < height; j++ ) {
      if( Math.random() > .9) {
        if(Math.random() > (1-text.antChance)){
          poke( i, j, 255, 0, 0, 242, tex )      
        } else {
          poke( i, j, 255, 255, 255, 255, tex )
        }
      } else if(text.allWhite === true){
        poke( i, j, 255, 255, 255, 255, tex )
      } else {
        poke( i, j, 0, 0, 0, 255, tex )  
      }
    }
  }
}

function init( gl ) {
  const realW = Math.floor(gl.drawingBufferWidth/text.resolution);
  const realH = Math.floor(gl.drawingBufferHeight/text.resolution);
  state[0] = fbo( gl, [realW,realH] )
  state[1] = fbo( gl, [realW,realH] )
  
  sim = createShader( gl, vert, gol )
  setInitialState( realW,realH, state[0].color[0] )
  initialized = 0
}

let current = 0
function tick( gl ) {
  const prevState = state[current]
  const curState = state[current ^= 1]
 
  curState.bind() // fbo
  sim.bind()      // shader
  
  const realW = Math.floor(gl.drawingBufferWidth/text.resolution);
  const realH = Math.floor(gl.drawingBufferHeight/text.resolution);
  sim.uniforms.resolution = [ realW, realH ]
  sim.uniforms.state = prevState.color[0].bind()
  sim.uniforms.time = count;
  sim.uniforms.speed = text.intervalDelay;
  sim.uniforms.blueFilledLevel = text.blueFilledLevel;
  sim.uniforms.greenFilledLevel = text.greenFilledLevel;
  sim.uniforms.blueNonLevel = text.blueNonLevel;
  sim.uniforms.greenNonLevel = text.greenNonLevel;
  sim.uniforms.minFilledBlue = text.minFilledBlue;
  sim.uniforms.minFilledGreen = text.minFilledGreen;
  sim.uniforms.minNonBlue = text.minNonBlue;
  sim.uniforms.minNonGreen = text.minNonGreen;
  sim.uniforms.redLevel = text.redLevel;
  sim.uniforms.minRed = text.minRed;
  sim.uniforms.degredationRate = text.degredationRate;
  sim.uniforms.blackAndWhite = text.blackAndWhite;
  sim.uniforms.moveDistance = text.moveDistance;
  
  sim.attributes.a_position.location = 0
  
  fillScreen( gl )
}

function deInitialize(){
  initialized = 1;
  state = [];
  sim = null;
  delay = 10;
}

function reColor( gl ){
  const realW = Math.floor(gl.drawingBufferWidth/text.resolution);
  const realH = Math.floor(gl.drawingBufferHeight/text.resolution);
  setInitialState( realW,realH, state[current].color[0] )
  recolor = false;
}

let count = 0
toy( draw, (gl, shader) => {
  if(recolor){
    reColor(gl)
    delay = 10;
  }
  if( initialized === 1 && text && text.playPause){
      init( gl )
  }

  if(delay > 0){
    delay -= 1;
    return
  }

  if(initialized === 0 && text && text.playPause && state.length > 0){ 

    tick( gl )
    shader.bind()

    // restore default framebuffer binding after overriding in tick
    gl.bindFramebuffer( gl.FRAMEBUFFER, null )
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

    const realW = Math.floor(gl.drawingBufferWidth);
    const realH = Math.floor(gl.drawingBufferHeight);
    shader.uniforms.resolution = [ realW, realH ]
    shader.uniforms.uSampler = state[ 0 ].color[0].bind()
    shader.uniforms.time = count++
  }
})