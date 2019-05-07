window.addEventListener('load', mainFunc);
var delay = 25;
var pause = false;
//Once the page is loaded, mainFunc is run. mainFunc just adds a 
function mainFunc() {
    var dimensions = document.getElementById("dimensions");
    var username = document.getElementById("username");
    if (dimensions) {
        dimensions.onchange = onDimensionsChange;
        dimensions.oninput = onDimensionsInput;
    }

    if (dimensions && username) {
        gridInit(10);
    }
}