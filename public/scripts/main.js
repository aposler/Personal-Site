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

//Resonds the dimensions slider changing, and updates the grid size
function onDimensionsChange(event) {
    var dimensions = this.value;
    gridInit(dimensions);
}

//Responds to the dimensions slider moving, but not having the mouse taken off. 
//Updates the curDimen div with the current value of dimensions
function onDimensionsInput(event) {
    var info = document.getElementById("curDimen");
    var dimensions = this.value;
    info.innerHTML = dimensions;
}

//Draws a grid of dimensions by dimensions, with each square being blocksize by
//blocksize pixels, and the entire thing being offset from the top and left by offSet
function gridDraw(blockSize, offSet, dimensions, fill, ctx) {
    ctx.lineWidth = 3;
    var offSetFull = Math.floor(ctx.canvas.width % dimensions);
    var gridEnd = (ctx.canvas.width - (offSetFull - offSet));
    if (fill) {
        for (var i = 0 + offSet; i < gridEnd; i += blockSize) {
            for (var j = 0 + offSet; j < gridEnd; j += blockSize) {
                ctx.fillRect(i, j, blockSize, blockSize);
                ctx.strokeRect(i, j, blockSize, blockSize);
            }
        }
    } else {
        for (var i = 0 + offSet; i < gridEnd; i += blockSize) {
            for (var j = 0 + offSet; j < gridEnd; j += blockSize) {
                ctx.strokeRect(i, j, blockSize, blockSize);
            }
        }
    }
}

//Does way to much honestly. Initializes all grids and their backends, as well
//as adding listeners to the username textbox, the "Enter Username" button, the grid
//name text box, the "Save Grid" button, the grids combobox, the "Load Grid" button,
//Delay slider, the "Pause" button, the "Continue" button, the "Step" button, the 
//"clear" button, and the "solve" button. It also handles all interactions in the grids
function gridInit(dimensions) {
    var canvases = {
        "aStar": { "canvas": document.getElementById("aStarCanvas") },
        "breadth": { "canvas": document.getElementById("breadthCanvas") },
        "depth": { "canvas": document.getElementById("depthCanvas") },
        "greedy": { "canvas": document.getElementById("greedyCanvas") }
    };
    var mouseClicked = false;
    var exCanvas = canvases.aStar.canvas;
    var offSet = Math.floor((exCanvas.clientWidth % dimensions) / 2);
    var initWidth = exCanvas.clientWidth;
    var blockSize = Math.floor(exCanvas.clientWidth / dimensions);
    var fillOrRemove = false; //Variable that tells whether the current mouse dragging should fill blocks or
    var curCanvases = Object.values(canvases);
    var solving = false;
    for (var i = 0; i < curCanvases.length; ++i) {
        var curVal = curCanvases[i];
        curVal.canvas.height = curVal.canvas.clientHeight;
        curVal.canvas.width = curVal.canvas.clientWidth;
        curVal.ctx = curVal.canvas.getContext("2d");
        curVal.solved = false;
    }
    curCanvases = Object.values(canvases);

    for (var i = 0; i < curCanvases.length; ++i) {
        var curVal = curCanvases[i];
        curVal.ctx.fillStyle = "white";
        curVal.ctx.strokeStyle = "blue";
        gridDraw(blockSize, offSet, dimensions, true, curVal.ctx);
        curVal.backArray = [];
        for (var j = 0; j < dimensions; ++j) {
            curVal.backArray.push([]);
            curVal.backArray[j].length = dimensions;
            curVal.backArray[j].fill(0);
        }
        curVal.canvas.onmouseup = gridsMouseUp;
        curVal.canvas.onmousedown = gridsMouseDown;
        curVal.canvas.onmouseleave = gridsMouseLeave;
        curVal.canvas.onmousemove = gridsMouseMove;
    }

    //Responds to mouseup's on all the canvases and unsets the flag
    function gridsMouseUp(event) {
        mouseClicked = false;
    }

    //Responds to mousedown's on all the canvases. Draws the obstacle on the grid and 
    //updates the backend at the current location.
    function gridsMouseDown(event) {
        if (solving) {
            return;
        }

        var borderOffset = 5;
        var resizedOffSet = Math.ceil((this.clientWidth / initWidth) * offSet);
        var resizedBlockSize = Math.floor((this.clientWidth - (resizedOffSet * 2)) / dimensions);
        var xDown = event.layerX - (borderOffset + resizedOffSet);
        var yDown = event.layerY - (borderOffset + resizedOffSet);
        var xDex = Math.floor(xDown / resizedBlockSize);
        var yDex = Math.floor(yDown / resizedBlockSize);
        for (var i = 0; i < curCanvases.length; ++i) {
            curVal = curCanvases[i];
            if (curVal.solved) {
                reInitGrid(curVal.backArray, dimensions, blockSize, offSet, curVal.ctx);
                curVal.solved = false;
            }
            if (xDex >= 0 && xDex < dimensions && yDex >= 0 && yDex < dimensions) {
                if (curVal.backArray[xDex][yDex] === 0) {
                    fillOrRemove = true;
                    curVal.ctx.fillStyle = "brown";
                    curVal.ctx.strokeStyle = "blue";
                    curVal.backArray[xDex][yDex] = 1;
                    curVal.ctx.fillRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                    curVal.ctx.strokeRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                } else {
                    fillOrRemove = false;
                    curVal.ctx.fillStyle = "white";
                    curVal.ctx.strokeStyle = "blue";
                    curVal.backArray[xDex][yDex] = 0;
                    curVal.ctx.fillRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                    curVal.ctx.strokeRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                }
                mouseClicked = true;
            }
        }
    }

    //responds to mouseleave events on all canvases and unsets the flag;
    function gridsMouseLeave(event) {
        mouseClicked = false;
    }

    //responds to mousemove events on all canvases. Draws the obstacle on the grid and 
    //updates the backend at the current location.
    function gridsMouseMove(event) {
        if (mouseClicked && !solving) {
            var borderOffset = 5;
            var resizedOffSet = Math.floor((this.clientWidth / initWidth) * offSet);
            var resizedBlockSize = Math.floor((this.clientWidth - (resizedOffSet * 2)) / dimensions);
            var xDown = event.layerX - (borderOffset + resizedOffSet);
            var yDown = event.layerY - (borderOffset + resizedOffSet);
            var xDex = Math.floor(xDown / resizedBlockSize);
            var yDex = Math.floor(yDown / resizedBlockSize);
            for (var i = 0; i < curCanvases.length; ++i) {
                curVal = curCanvases[i];
                if (xDex >= 0 && xDex < dimensions && yDex >= 0 && yDex < dimensions) {
                    if (fillOrRemove) {
                        curVal.ctx.fillStyle = "brown";
                        curVal.ctx.strokeStyle = "blue";
                        curVal.backArray[xDex][yDex] = 1;
                        curVal.ctx.fillRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                        curVal.ctx.strokeRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                    } else {
                        curVal.ctx.fillStyle = "white";
                        curVal.ctx.strokeStyle = "blue";
                        curVal.backArray[xDex][yDex] = 0;
                        curVal.ctx.fillRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                        curVal.ctx.strokeRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                    }
                }
            }
        }
    }

    //Signals the pathing algorithm to start solving the maze
    document.getElementById("solve").onclick = function (event) {
        if (gridsSolved()) {
            for (var i = 0; i < curCanvases.length; ++i) {
                var canvas = curCanvases[i];
                canvas.solved = false;
                reInitGrid(canvas.backArray, dimensions, blockSize, offSet, canvas.ctx);
            }
        }

        canvases.aStar.aStarPath = new aStar(canvases.aStar.backArray, blockSize, offSet, canvases.aStar.ctx, function () {
            canvases.aStar.solved = true;
            canvases.aStar.path = null;
            for (var i = 0; i < curCanvases.length; ++i) {
                if (curCanvases[i].solved === false) {
                    return;
                }
            }
            pause = false;
            solving = false;
        });
        canvases.breadth.breadthPath = new breadth(canvases.breadth.backArray, canvases.breadth.ctx, function () {
            canvases.breadth.solved = true;
            canvases.breadth.path = null;
            for (var i = 0; i < curCanvases.length; ++i) {
                if (curCanvases[i].solved === false) {
                    return;
                }
            }
            pause = false;
            solving = false;
        });
        canvases.depth.depthPath = new depth(canvases.depth.backArray, canvases.depth.ctx, function () {
            canvases.depth.solved = true;
            canvases.depth.path = null;
            for (var i = 0; i < curCanvases.length; ++i) {
                if (curCanvases[i].solved === false) {
                    return;
                }
            }
            pause = false;
            solving = false;
        });
        canvases.greedy.greedyPath = new greedy(canvases.greedy.backArray, blockSize, offSet, canvases.greedy.ctx, function () {
            canvases.greedy.solved = true;
            canvases.greedy.path = null;
            for (var i = 0; i < curCanvases.length; ++i) {
                if (curCanvases[i].solved === false) {
                    return;
                }
            }
            pause = false;
            solving = false;
        });
        solving = true;
        continuePath(blockSize, offSet, canvases.aStar.aStarPath, canvases.breadth.breadthPath,
            canvases.depth.depthPath, canvases.greedy.greedyPath);
    }

    //Reinitializes the grid upon pressing the "Clear" button.
    document.getElementById("restart").onclick = function (event) {
        if (solving) {
            alert("You must stop the solve first");
            return;
        }
        gridInit(dimensions);
    }

    //On enter sends the username to the server and populates the combobox with the received values
    var username = document.getElementById("username");
    username.onkeypress = function (event) {
        if (!event) {
            event = window.event;
        }
        var keyPressed = event.keyPressed || event.which;
        if (keyPressed === 13) {
            var username = document.getElementById("username");
            if (username.value === "") {
                alert("Please enter a username");
                return;
            }
            submitUser(username.value);
        }
    }

    //On enter sends the grid and gridname to the server, and populates the combobox with the
    //received values
    var gridName = document.getElementById("gridName");
    gridName.onkeypress = function (event) {
        if (!event) {
            event = window.event;
        }
        var keyPressed = event.keyPressed || event.which;
        if (keyPressed === 13) {
            saveGrid();
        }
    }

    //Sends the grid and gridname to the server, and populates the combobox with the
    //received values
    var saveGridBtn = document.getElementById("save");
    saveGridBtn.onclick = saveGrid;

    function saveGrid() {
        var username = document.getElementById("username");
        if (username.value === "") {
            alert("Please enter a username");
            return;
        }
        var exCanvas = canvases.aStar;
        var gridName = document.getElementById("gridName");

        var sendStruct = {
            "requestType": "add",
            "username": username.value,
            "grid": stripBackArray(exCanvas.backArray),
            "gridName": gridName.value
        };

        var httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function () {
            if (httpReq.readyState === 4 && httpReq.status === 200) {
                var resStruct = JSON.parse(httpReq.responseText);
                if (resStruct.valid === false) {
                    alert("That username/grid name combination is taken");
                    return;
                }
                var nameBox = document.getElementById("nameBox");
                nameBox.options.length = 0;
                var names = resStruct.names;
                for (var i = 0; i < names.length; ++i) {
                    var curOption = document.createElement("option");
                    curOption.text = names[i].gridName;
                    nameBox.add(curOption);
                }
            }
        };
        httpReq.open("POST", "/");
        httpReq.setRequestHeader('Content-type', 'application/json');
        httpReq.send(JSON.stringify(sendStruct))
    }

    //Sends the username to the server and populates the combobox with the received values
    var enterUser = document.getElementById("enterUser");
    enterUser.onclick = function (event) {
        var username = document.getElementById("username");
        if (username.value === "") {
            alert("Please enter a username");
            return;
        }
        submitUser(username.value);
    }

    function submitUser(username) {
        var sendStruct = {
            "requestType": "request",
            "username": username,
        };
        var httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function () {
            if (httpReq.readyState === 4 && httpReq.status === 200) {
                var resStruct = JSON.parse(httpReq.responseText);
                if (resStruct.valid === false) {
                    alert("That username/grid name combination is taken");
                    return;
                }
                var nameBox = document.getElementById("nameBox");
                nameBox.options.length = 0;
                var names = resStruct.names;
                for (var i = 0; i < names.length; ++i) {
                    var curOption = document.createElement("option");
                    curOption.text = names[i].gridName;
                    nameBox.add(curOption);
                }
            }
        };
        httpReq.open("POST", "/");
        httpReq.setRequestHeader('Content-type', 'application/json');
        httpReq.send(JSON.stringify(sendStruct))
    }

    //Requests the grid signified by the username and grid name from the server, and replaces
    //the current grid with itt
    var loadGrid = document.getElementById("load");
    if (solving) {
        alert("You must stop the solve first");
        return;
    }
    loadGrid.onclick = function (event) {
        var username = document.getElementById("username");
        if (username.value === "") {
            alert("Please enter a username");
            return;
        }
        var exCanvas = canvases.aStar;

        var nameBox = document.getElementById("nameBox");
        var gridName = nameBox.options[nameBox.selectedIndex].text;
        var sendStruct = {
            "requestType": "grid",
            "username": username.value,
            "gridName": gridName
        };
        var httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function () {
            if (httpReq.readyState === 4 && httpReq.status === 200) {
                var gridRes = JSON.parse(httpReq.responseText);
                var grid = JSON.parse(gridRes.grid);
                dimensions = grid.length;
                exCanvas = canvases.aStar.canvas;
                offSet = Math.floor((exCanvas.clientWidth % dimensions) / 2);
                blockSize = Math.floor(exCanvas.clientWidth / dimensions);
                document.getElementById("dimensions").value = dimensions;
                document.getElementById("curDimen").innerHTML = dimensions;
                for (var i = 0; i < curCanvases.length; ++i) {
                    var curVal = curCanvases[i];
                    curVal.backArray = grid;
                    reInitGrid(grid, dimensions, blockSize, offSet, curVal.ctx);
                    grid = JSON.parse(gridRes.grid);
                }
            }
        };
        httpReq.open("POST", "/");
        httpReq.setRequestHeader('Content-type', 'application/json');
        httpReq.send(JSON.stringify(sendStruct))
    }

    //Increases the delay between algorithm iterations
    var delaySlider = document.getElementById("delay");
    delaySlider.oninput = function () {
        var info = document.getElementById("curDelay");
        var delayVal = this.value;
        info.innerHTML = delayVal;
        delay = delayVal;
    }

    //Pauses the algorithms
    var pauseBtn = document.getElementById("pause");
    pauseBtn.onclick = function () {
        pause = true;
    }

    //Continues the automatic pathing algorithm
    var continueBtn = document.getElementById("continue");
    continueBtn.onclick = function () {
        pause = false;
        if (solving) {
            continuePath(blockSize, offSet, canvases.aStar.aStarPath, canvases.breadth.breadthPath,
                canvases.depth.depthPath, canvases.greedy.greedyPath);
        }
    }

    //Steps the algorithm forward one iteration
    var stepBtn = document.getElementById("step");
    stepBtn.onclick = function () {
        pause = true;
        if (solving) {
            continuePath(blockSize, offSet, canvases.aStar.aStarPath, canvases.breadth.breadthPath,
                canvases.depth.depthPath, canvases.greedy.greedyPath);
        }
    }

    //Tells whether all the grids are solves
    function gridsSolved() {
        for (var i = 0; i < curCanvases.length; ++i) {
            if (curCanvases[i].solved === false) {
                return false;
            }
        }
        return true;
    }

    //Stops the solve
    var stopBtn = document.getElementById("stop");
    stopBtn.onclick = function () {
        var oldPause = pause;
        pause = true;
        if (solving) {
            setTimeout(stopSolve, delay, oldPause);
        }
    }

    function stopSolve(oldPause) {
        for (var i = 0; i < curCanvases.length; ++i) {
            var canvas = curCanvases[i];
            canvas.solved = false;
            reInitGrid(canvas.backArray, dimensions, blockSize, offSet, canvas.ctx);
        }
        solving = false;
        pause = oldPause;
    }
}

//Strips all values besides 1 and 0 from the backArray
function stripBackArray(backArray) {
    var newArray = [];
    for (i = 0; i < backArray.length; ++i) {
        newArray.push([]);
        for (j = 0; j < backArray[i].length; ++j) {
            if (backArray[i][j] != 1) {
                newArray[i][j] = 0;
            } else {
                newArray[i][j] = 1;
            }
        }
    }
    return newArray;
}

//Goes through the grid and redraws every block the way it was, unless it was part of the solved path or set
//to 2 by the pathing algorith. Solved path blocks are redrawn to empty, and all spots set to 2 are set to 0.
function reInitGrid(grid, dimensions, blockSize, offSet, ctx) {
    for (var i = 0; i < dimensions; i++) {
        for (var j = 0; j < dimensions; j++) {
            if (grid[i][j] === 1) {
                ctx.fillStyle = "brown";
                ctx.strokeStyle = "blue";
                ctx.fillRect((i * blockSize) + offSet, (j * blockSize) + offSet, blockSize, blockSize);
                ctx.strokeRect((i * blockSize) + offSet, (j * blockSize) + offSet, blockSize, blockSize);
            } else {
                grid[i][j] = 0;
                ctx.fillStyle = "white";
                ctx.strokeStyle = "blue";
                ctx.fillRect((i * blockSize) + offSet, (j * blockSize) + offSet, blockSize, blockSize);
                ctx.strokeRect((i * blockSize) + offSet, (j * blockSize) + offSet, blockSize, blockSize);
            }
        }
    }
}


//aStarPathNode function that contains the position, value (combination of estimated cost
//to end and movement cost from start), estimated cost to end, movement cost from beginning,
//and parent node you travel to this node from.
class aStarPathNode {
    constructor(xPos, yPos, worth, estCost, moveCost, parent) {
        this._x = xPos;
        this._y = yPos;
        this._worth = worth;
        this._estCost = estCost;
        this._moveCost = moveCost;
        this._parent = parent;
    }
    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get worth() {
        return this._worth;
    }

    set worth(value) {
        this._worth = value;
    }

    get moveCost() {
        return this._moveCost;
    }

    set moveCost(value) {
        this._moveCost = value;
    }

    get estCost() {
        return this._estCost;
    }

    set estCost(value) {
        this._estCost = value;
    }

    get parent() {
        return this._parent;
    }

    set parent(value) {
        this._parent = value;
    }
}

//depthPathNode function that contains the position, and parent node you travel to
//this node from.
class depthBreadthPathNode {
    constructor(xPos, yPos, parent) {
        this._x = xPos;
        this._y = yPos;
        this._parent = parent;
    }
    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get parent() {
        return this._parent;
    }

    set parent(value) {
        this._parent = value;
    }
}

//greedyNode function that contains the position, estCost (estimated cost
//to end), and parent node you travel to this node from.
class greedyPathNode {
    constructor(xPos, yPos, estCost, parent) {
        this._x = xPos;
        this._y = yPos;
        this._estCost = estCost;
        this._parent = parent;
    }
    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get worth() {
        return this._worth;
    }

    set worth(value) {
        this._worth = value;
    }

    get moveCost() {
        return this._moveCost;
    }

    set moveCost(value) {
        this._moveCost = value;
    }

    get estCost() {
        return this._estCost;
    }

    set estCost(value) {
        this._estCost = value;
    }

    get parent() {
        return this._parent;
    }

    set parent(value) {
        this._parent = value;
    }
}

//An aStarPath class, used to store the open list and perform actions on them.
class aStarPath {
    constructor() {
        this._open = [];
    }

    //Checks the open array to see if the existing node with the given x and y exists. If the node exists then
    //the function checks if the new version of the node has a smaller move cost, and if it does then it
    //changes the existing nodes moveCost to the new one, worth to the new one, and parentNode
    //to the new one
    update(xPos, yPos, value, parentNode) {
        for (var i = 0; i < (this._open).length; i++) {
            var tempNode = this._open[i];
            if (tempNode.x === xPos && tempNode.y === yPos) {
                if (tempNode.moveCost > value) {
                    tempNode.worth = tempNode.estCost + value;
                    tempNode.moveCost = value;
                    tempNode.parent = parentNode;
                }
                return true;
            }
        }
        return false;
    }

    //Adds the node to the open array if the node does not already exist in the array. If it already exists
    //it checks if the new version of the node has a smaller move cost. if it has a better move cost then it
    //changes the existing nodes moveCost to the new one, worth to the new one, and parentNode
    //to the new one
    add(node) {
        if (!(this.update(node.x, node.y, node.moveCost, node.parent))) {
            this._open.push(node);
        }
    }

    //Deletes the node from the open list. It is named swap because traditionally
    //A* would have a closed list of nodes that have already been checked that you would
    //swap the node into. I did not implement the closed list because I simply set visited nodes in the grid,
    //so this function only removes the node from open
    swap(xPos, yPos) {
        for (var i = 0; i < (this._open).length; i++) {
            var tempNode = this._open[i];
            if (tempNode.x === xPos && tempNode.y === yPos) {
                ((this._open).splice(i, 1))[0];
                return true;
            }
        }
        return false;
    }

    //Returns a boolean on whether or not the open array has values
    valid() {
        if ((this._open).length !== 0) {
            return true;
        } else {
            return false;
        }
    }

    //Determines the next node and returns it. Returns the node from open with the lowest
    //worth. If there are multiple nodes with the same worth it will check if any are directly adjacent to 
    //the current node. If only one is  directly adjacent then it returns that one, but if there are multiple it
    //chooses them in the importance right->down->left->up. If none are adjacent it chooses 
    //the first one it finds in the list, starting from 0.
    next(node) {
        var least = (this._open)[0];
        var proximity = 5;
        (this._open).forEach(function (element) {
            if (element.worth < least.worth) {
                least = element;
                proximity = 5;
            }
            if (element.worth === least.worth) {
                var newProximity;
                if (element.x === node.x) {
                    if (element.y - 1 === node.y) {
                        newProximity = 2;
                    } else if (element.y + 1 === node.y) {
                        newProximity = 4;
                    }
                }
                if (element.y === node.y) {
                    if (element.x - 1 === node.x) {
                        newProximity = 1;
                    } else if (element.x + 1 === node.x) {
                        newProximity = 3;
                    }
                }
                if (newProximity < proximity) {
                    least = element;
                    proximity = newProximity;
                }
            }
        });
        return least;
    }

    get open() {
        return this._open;
    }
}

//A greedy path class, used to store the open list and perform actions on them.
class greedyPath {
    constructor() {
        this._open = [];
    }

    //Checks the open array to see if the existing node with the given x and y exists. 
    exists(xPos, yPos, value, parentNode) {
        for (var i = 0; i < (this._open).length; i++) {
            var tempNode = this._open[i];
            if (tempNode.x === xPos && tempNode.y === yPos) {
                return true;
            }
        }
        return false;
    }

    //Adds the node to the open array if the node does not already exist in the array.
    add(node) {
        if (!(this.exists(node.x, node.y, node.moveCost, node.parent))) {
            this._open.push(node);
        }
    }

    //Deletes the node from the open list. It is named swap because traditionally
    //A* would have a closed list of nodes that have already been checked that you would
    //swap the node into. I did not implement the closed list because I simply set visited nodes in the grid,
    //so this function only removes the node from open
    swap(xPos, yPos) {
        for (var i = 0; i < (this._open).length; i++) {
            var tempNode = this._open[i];
            if (tempNode.x === xPos && tempNode.y === yPos) {
                ((this._open).splice(i, 1))[0];
                return true;
            }
        }
        return false;
    }

    //Returns a boolean on whether or not the open array has values
    valid() {
        if ((this._open).length !== 0) {
            return true;
        } else {
            return false;
        }
    }

    //Determines the next node and returns it. Returns the node from open with the lowest
    //worth. If there are multiple nodes with the same estCost it will check if any are directly adjacent to 
    //the current node. If only one is  directly adjacent then it returns that one, but if there are multiple it
    //chooses them in the importance right->down->left->up. If none are adjacent it chooses 
    //the first one it finds in the list, starting from 0.
    next(node) {
        var least = (this._open)[0];
        var proximity = 5;
        (this._open).forEach(function (element) {
            if (element.estCost < least.estCost) {
                least = element;
                proximity = 5;
            }
            if (element.estCost === least.estCost) {
                var newProximity;
                if (element.x === node.x) {
                    if (element.y - 1 === node.y) {
                        newProximity = 2;
                    } else if (element.y + 1 === node.y) {
                        newProximity = 4;
                    }
                }
                if (element.y === node.y) {
                    if (element.x - 1 === node.x) {
                        newProximity = 1;
                    } else if (element.x + 1 === node.x) {
                        newProximity = 3;
                    }
                }
                if (newProximity < proximity) {
                    least = element;
                    proximity = newProximity;
                }
            }
        });
        return least;
    }

    get open() {
        return this._open;
    }
}

//Class that performs aStar pathing algorithm
class aStar {
    constructor(grid, blockSize, offSet, ctx, solvedCallback) {
        this.grid = grid;
        this.ctx = ctx;
        this.pathMain = new aStarPath();
        this.callback = solvedCallback;
        this.curNode = new aStarPathNode(0, 0, (this.grid.length * 2), (this.grid.length * 2), 0, null);
        if (this.grid[0][0] === 0) {
            this.ctx.fillStyle = "gray";
            this.ctx.strokeStyle = "blue";
            this.ctx.fillRect((this.curNode.x * blockSize) + offSet, (this.curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.ctx.strokeRect((this.curNode.x * blockSize) + offSet, (this.curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.pathMain.add(this.curNode);
        }
    }

    update(blockSize, offSet) {
        var lastEntry = this.grid.length - 1;
        if (this.pathMain.valid() && ((this.curNode.x !== (lastEntry)) || (this.curNode.y !== (lastEntry)))) {
            this.grid[this.curNode.x][this.curNode.y] = 2;
            this.pathMain.swap(this.curNode.x, this.curNode.y);
            aStarAddPath(this.curNode, this.pathMain, this.grid);
            this.curNode = this.pathMain.next(this.curNode);
            if (!this.curNode) {
                this.pathFound = true;
                return;
            }
            this.ctx.fillStyle = "gray";
            this.ctx.strokeStyle = "blue";
            this.ctx.fillRect((this.curNode.x * blockSize) + offSet, (this.curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.ctx.strokeRect((this.curNode.x * blockSize) + offSet, (this.curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.pathFound = false;
        } else {
            this.pathFound = true;
        }
    }

    complete(blockSize, offSet) {
        this.completed = true;
        var aStarInfo = document.getElementById("aStarInfo");
        var aStarText = aStarInfo.innerHTML.split(":")[0];
        if (this.pathMain.valid()) {
            this.ctx.fillStyle = "green";
            this.ctx.strokeStyle = "blue";
            drawPath(this.curNode, blockSize, offSet, this.ctx)
            var pathLength = getPathLength(this.curNode, 0);
            aStarText = aStarText + ": Path is " + pathLength + " blocks long";

        } else {
            this.ctx.strokeStyle = "red";
            gridDraw(blockSize, offSet, this.grid.length, false, this.ctx);
            aStarText = aStarText + ": Could not find path";
        }
        aStarInfo.innerHTML = aStarText;
        this.callback();
    }
}

//Class that performs breadth first searching algorithm
class breadth {
    constructor(grid, ctx, solvedCallback) {
        this.grid = grid;
        this.ctx = ctx;
        this._open = [];
        var curNode = new depthBreadthPathNode(0, 0, null);
        this.callback = solvedCallback;
        if (this.grid[0][0] === 0) {
            this.grid[0][0] = 2;
            this._open.push(curNode);
        }
    }

    update(blockSize, offSet) {
        if (this._open.length <= 0) {
            this.pathFound = true;
            return;
        }
        var lastEntry = this.grid.length - 1;
        var curNode = this._open.shift();
        if (((curNode.x !== (lastEntry)) || (curNode.y !== (lastEntry)))) {
            breadthAddPath(curNode, this._open, this.grid);
            this.ctx.fillStyle = "gray";
            this.ctx.strokeStyle = "blue";
            this.ctx.fillRect((curNode.x * blockSize) + offSet, (curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.ctx.strokeRect((curNode.x * blockSize) + offSet, (curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.pathFound = false;
        } else {
            this.finalNode = curNode;
            this.pathFound = true;
        }
    }

    complete(blockSize, offSet) {
        this.completed = true;
        var breadthInfo = document.getElementById("breadthInfo");
        var breadthText = breadthInfo.innerHTML.split(":")[0];
        if (this.finalNode) {
            this.ctx.fillStyle = "green";
            this.ctx.strokeStyle = "blue";
            drawPath(this.finalNode, blockSize, offSet, this.ctx)
            var pathLength = getPathLength(this.finalNode, 0);
            breadthText = breadthText + ": Path is " + pathLength + " blocks long";
        } else {
            this.ctx.strokeStyle = "red";
            gridDraw(blockSize, offSet, this.grid.length, false, this.ctx);
            breadthText = breadthText + ": Could not find path";
        }
        breadthInfo.innerHTML = breadthText;
        this.callback();
    }
}

//Class that performs depth first pathing algorithm
class depth {
    constructor(grid, ctx, solvedCallback) {
        this.grid = grid;
        this.ctx = ctx;
        this._open = [];
        var curNode = new depthBreadthPathNode(0, 0, null);
        this.callback = solvedCallback;
        if (this.grid[0][0] === 0) {
            this._open.push(curNode);
        }
    }

    update(blockSize, offSet) {
        if (this._open.length <= 0) {
            this.pathFound = true;
            return;
        }
        var lastEntry = this.grid.length - 1;
        var curNode = this._open.pop();
        this.grid[curNode.x][curNode.y] = 2;
        if (((curNode.x !== (lastEntry)) || (curNode.y !== (lastEntry)))) {
            depthAddPath(curNode, this._open, this.grid);
            this.ctx.fillStyle = "gray";
            this.ctx.strokeStyle = "blue";
            this.ctx.fillRect((curNode.x * blockSize) + offSet, (curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.ctx.strokeRect((curNode.x * blockSize) + offSet, (curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.pathFound = false;
        } else {
            this.finalNode = curNode;
            this.pathFound = true;
        }
    }

    complete(blockSize, offSet) {
        this.completed = true;
        var depthInfo = document.getElementById("depthInfo");
        var depthText = depthInfo.innerHTML.split(":")[0];
        if (this.finalNode) {
            this.ctx.fillStyle = "green";
            this.ctx.strokeStyle = "blue";
            drawPath(this.finalNode, blockSize, offSet, this.ctx)
            var pathLength = getPathLength(this.finalNode, 0);
            depthText = depthText + ": Path is " + pathLength + " blocks long";
        } else {
            this.ctx.strokeStyle = "red";
            gridDraw(blockSize, offSet, this.grid.length, false, this.ctx);
            depthText = depthText + ": Could not find path";
        }
        depthInfo.innerHTML = depthText;
        this.callback();
    }
}

//Class that performs greedy best first pathing algorithm
class greedy {
    constructor(grid, blockSize, offSet, ctx, solvedCallback) {
        this.grid = grid;
        this.ctx = ctx;
        this.pathMain = new greedyPath();
        this.curNode = new greedyPathNode(0, 0, (this.grid.length * 2), null);
        this.callback = solvedCallback;
        if (this.grid[0][0] === 0) {
            this.ctx.fillStyle = "gray";
            this.ctx.strokeStyle = "blue";
            this.ctx.fillRect((this.curNode.x * blockSize) + offSet, (this.curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.ctx.strokeRect((this.curNode.x * blockSize) + offSet, (this.curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.pathMain.add(this.curNode);
        }
    }

    update(blockSize, offSet) {
        var lastEntry = this.grid.length - 1;
        if (this.pathMain.valid() && ((this.curNode.x !== (lastEntry)) || (this.curNode.y !== (lastEntry)))) {
            this.grid[this.curNode.x][this.curNode.y] = 2;
            this.pathMain.swap(this.curNode.x, this.curNode.y);
            greedyAddPath(this.curNode, this.pathMain, this.grid);
            this.curNode = this.pathMain.next(this.curNode);
            if (!this.curNode) {
                this.pathFound = true;
                return;
            }
            this.ctx.fillStyle = "gray";
            this.ctx.strokeStyle = "blue";
            this.ctx.fillRect((this.curNode.x * blockSize) + offSet, (this.curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.ctx.strokeRect((this.curNode.x * blockSize) + offSet, (this.curNode.y * blockSize) + offSet, blockSize, blockSize);
            this.pathFound = false;
        } else {
            this.pathFound = true;
        }
    }

    complete(blockSize, offSet) {
        this.completed = true;
        var greedyInfo = document.getElementById("greedyInfo");
        var greedyText = greedyInfo.innerHTML.split(":")[0];
        if (this.pathMain.valid()) {
            this.ctx.fillStyle = "green";
            this.ctx.strokeStyle = "blue";
            drawPath(this.curNode, blockSize, offSet, this.ctx)
            var pathLength = getPathLength(this.curNode, 0);
            greedyText = greedyText + ": Path is " + pathLength + " blocks long";

        } else {
            this.ctx.strokeStyle = "red";
            gridDraw(blockSize, offSet, this.grid.length, false, this.ctx);
            greedyText = greedyText + ": Could not find path";
        }
        greedyInfo.innerHTML = greedyText;
        this.callback();
    }
}

//Class that continues each pathing algorithm after "delay" amount of time and if the pause
//variable is false
function continuePath(blockSize, offSet, aStarPath, breadthPath, depthPath, greedyPath) {
    if (aStarPath.completed != true) {
        if (aStarPath.pathFound != true) {
            aStarPath.update(blockSize, offSet);
        } else {
            aStarPath.complete(blockSize, offSet);
        }
    }

    if (breadthPath.completed != true) {
        if (breadthPath.pathFound != true) {
            breadthPath.update(blockSize, offSet);
        } else {
            breadthPath.complete(blockSize, offSet);
        }
    }

    if (depthPath.completed != true) {
        if (depthPath.pathFound != true) {
            depthPath.update(blockSize, offSet);
        } else {
            depthPath.complete(blockSize, offSet);
        }
    }

    if (greedyPath.completed != true) {
        if (greedyPath.pathFound != true) {
            greedyPath.update(blockSize, offSet);
        } else {
            greedyPath.complete(blockSize, offSet);
        }
    }

    if ((aStarPath.completed != true || breadthPath.completed != true ||
        depthPath.completed != true || greedyPath.completed != true) && !pause) {
        setTimeout(continuePath, delay, blockSize, offSet, aStarPath, breadthPath, depthPath, greedyPath);
        return;
    }
}

//Draws the path back to the origin from the given node in green
function drawPath(node, blockSize, offSet, ctx) {
    if (node !== null) {
        ctx.fillRect((node.x * blockSize) + offSet, (node.y * blockSize) + offSet, blockSize, blockSize);
        ctx.strokeRect((node.x * blockSize) + offSet, (node.y * blockSize) + offSet, blockSize, blockSize);
        setTimeout(drawPath, delay, node.parent, blockSize, offSet, ctx);
    }
}

//Returns the length of the given path
function getPathLength(node, length) {
    if (node !== null) {
        return getPathLength(node.parent, length + 1);
    } else {
        return length;
    }
}

//Adds all the available nodes directly adjacent to the given node to the open list of pathMain
function aStarAddPath(parentNode, pathMain, grid) {
    var pathTemp = aStarCheckPath(parentNode.x - 1, parentNode.y, parentNode.moveCost + 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
    pathTemp = aStarCheckPath(parentNode.x, parentNode.y - 1, parentNode.moveCost + 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
    pathTemp = aStarCheckPath(parentNode.x + 1, parentNode.y, parentNode.moveCost + 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
    pathTemp = aStarCheckPath(parentNode.x, parentNode.y + 1, parentNode.moveCost + 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
}

//Adds all the available nodes directly adjacent to the given node to the open list of pathMain
function depthAddPath(parentNode, open, grid) {
    if (validPoint(parentNode.x - 1, parentNode.y, grid)) {
        var leftNode = new depthBreadthPathNode(parentNode.x - 1, parentNode.y, parentNode);
        open.push(leftNode);
    }
    if (validPoint(parentNode.x, parentNode.y - 1, grid)) {
        var upNode = new depthBreadthPathNode(parentNode.x, parentNode.y - 1, parentNode);
        open.push(upNode);
    }
    if (validPoint(parentNode.x, parentNode.y + 1, grid)) {
        var downNode = new depthBreadthPathNode(parentNode.x, parentNode.y + 1, parentNode);
        open.push(downNode);
    }
    if (validPoint(parentNode.x + 1, parentNode.y, grid)) {
        var rightNode = new depthBreadthPathNode(parentNode.x + 1, parentNode.y, parentNode);
        open.push(rightNode);
    }
}

//Adds all the available nodes directly adjacent to the given node to the open list of pathMain
function breadthAddPath(parentNode, open, grid) {
    if (validPoint(parentNode.x - 1, parentNode.y, grid)) {
        var leftNode = new depthBreadthPathNode(parentNode.x - 1, parentNode.y, parentNode);
        grid[parentNode.x - 1][parentNode.y] = 2;
        open.push(leftNode);
    }
    if (validPoint(parentNode.x, parentNode.y - 1, grid)) {
        var upNode = new depthBreadthPathNode(parentNode.x, parentNode.y - 1, parentNode);
        grid[parentNode.x][parentNode.y - 1] = 2;
        open.push(upNode);
    }
    if (validPoint(parentNode.x + 1, parentNode.y, grid)) {
        var rightNode = new depthBreadthPathNode(parentNode.x + 1, parentNode.y, parentNode);
        grid[parentNode.x + 1][parentNode.y] = 2;
        open.push(rightNode);
    }
    if (validPoint(parentNode.x, parentNode.y + 1, grid)) {
        var downNode = new depthBreadthPathNode(parentNode.x, parentNode.y + 1, parentNode);
        grid[parentNode.x][parentNode.y + 1] = 2;
        open.push(downNode);
    }
}

// Adds all the available nodes directly adjacent to the given node to the open list of pathMain
function greedyAddPath(parentNode, pathMain, grid) {
    var pathTemp = greedyCheckPath(parentNode.x - 1, parentNode.y, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
    pathTemp = greedyCheckPath(parentNode.x, parentNode.y - 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
    pathTemp = greedyCheckPath(parentNode.x + 1, parentNode.y, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
    pathTemp = greedyCheckPath(parentNode.x, parentNode.y + 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
}

// Determines if the given location is valid, and if it is calculates the correct movement distance from
// the origin(moveCost), the estimated travel time to the endpoint(estCost), and the combination of the
// two. Returns a node object created with those values if the location is valid, otherwise returns false;
function aStarCheckPath(xPos, yPos, moveCost, parentNode, grid) {
    if (validPoint(xPos, yPos, grid)) {
        var lastEntry = grid.length - 1;
        var shortPath = (lastEntry - xPos) + (lastEntry - yPos);
        var pathCost = shortPath + moveCost;
        return new aStarPathNode(xPos, yPos, pathCost, shortPath, moveCost, parentNode);
    } else {
        return false;
    }
}

// Determines if the given location is valid, and if it is calculates the the estimated travel time to the
//endpoint(estCost). Returns a node object created with those values if the location is valid,
//otherwise returns false;
function greedyCheckPath(xPos, yPos, parentNode, grid) {
    if (validPoint(xPos, yPos, grid)) {
        var lastEntry = grid.length - 1;
        var estCost = (lastEntry - xPos) + (lastEntry - yPos);
        return new greedyPathNode(xPos, yPos, estCost, parentNode);
    } else {
        return false;
    }
}


// Deterimines whether or not the desired point is valid (within the grid and walkable)
function validPoint(xPos, yPos, grid) {
    if (xPos >= 0 && xPos < grid.length && yPos >= 0 && yPos < grid.length
        && grid[xPos][yPos] === 0) {
        return true;
    } else {
        return false;
    }
}