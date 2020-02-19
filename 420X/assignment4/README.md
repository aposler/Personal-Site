# glslify-gol

This is a quick example of the game of life using glslify + gl-toy. It shows how to use gl-fbo and a couple of other parts of the stack.gl ecosystem. 

To get going, you can clone this repo and then run `npm install` to install the necessary packages. You can then use browserify with a glslify transform to compile:

`browserify main.js -t glslify -o bundle.js`

If you install `budo`:

npx budo main.js:bundle.js --live -- -t glslify

