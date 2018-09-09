//
// Mouse and Key event functions
//
// Diogo Ferreira
// Luís Leira
// 2017
//

var mouseDown = false;
var currentlyPressedKeys = {};

// From https://stackoverflow.com/questions/42309715/how-to-correctly-pass-mouse-coordinates-to-webgl
function getRelativeMousePosition(event, target) {
	target = target || event.target;
	var rect = target.getBoundingClientRect();

	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top,
	}
}

// assumes target or event.target is canvas
function getNoPaddingNoBorderCanvasRelativeMousePosition(event, target) {
	target = target || event.target;
	var pos = getRelativeMousePosition(event, target);

	pos.x = pos.x * target.width  / target.clientWidth;
	pos.y = pos.y * target.height / target.clientHeight;

	return pos;  
}


function handleMouseDown(event) {
	mouseDown = true;
}

function handleMouseUp(event) {
	mouseDown = false;
}


function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

function handleMouseWheel(event){
	// Move map backwards
	if(event.deltaY>0){
		tz -= 0.01;
		globalTZZ -= 0.05;
	}
	// Move maze forward
	else if(event.deltaY<0){
		tz += 0.01;
		globalTZZ += 0.05;
	}
}

function handleMouseMove(event) {

	if (!mouseDown) {
		return;
	} 
	
	// Rotation angles proportional to cursor displacement
	
	var pos = getNoPaddingNoBorderCanvasRelativeMousePosition(event, gl.canvas);
	var x = pos.x / gl.canvas.width;
	var y = pos.y / gl.canvas.height;

	// Limit x and y to viewport
	if(x<0)
		x=0;
	if(x>1)
		x=1;

	if(y<0)
		y=0;
	if(y>1)
		y=1;

	
	// On Left/Right mouse movement, change YY angle and XX translation
	globalYYAngle = x*180 - 90;
	globalTXX = (x-0.5)*10;

	// On Up/Down mouse movement, change XX angle and YY translation
	globalXXAngle = -y*90 + 90;
	globalTYY =  -Math.abs((y-1))*5;


	// Must be 2.5 because the cube has a global translation of -2.5
	variationGlobalTZZ = 2.5*Math.abs(y-1)+5*Math.abs((x-0.5));

}



function handleKeys() {
	
	if (currentlyPressedKeys[38]) {
		// Jump (up arrow or space)
		if(onGround || onTopOfCube){
			vY = 0.15;
			onGround = false;
			lastXXAngle = angleXX;
		}
	}

	if(currentlyPressedKeys[39]){
		// Move right (right arrow)
		if(tx+0.05>1){
			tx = 1.0;
		}
		else{
			tx +=0.05;
		}
	}
	
	if(currentlyPressedKeys[37]){
		// Move left (left arrow)
		if(tx-0.05<-1)
			tx = -1.0;
		else
			tx -= 0.05;
	}

	if (currentlyPressedKeys[83]) {
		// Start game
		if(maze.length>0){
			PLAY_GAME = true;
			game_velocity = INITIAL_GAME_VELOCITY;
		}
	}

	if (currentlyPressedKeys[82]) {
		// Restart game
		reset();
	}

	if (currentlyPressedKeys[76]) {
		// 'l' key
		if(!PLAY_GAME){
			// Set game velocity as low
			INITIAL_GAME_VELOCITY = 1/10000;
			game_velocity_type = 0;
		}
	}

	if (currentlyPressedKeys[77]) {
		// 'm' key
		if(!PLAY_GAME){
			// Set game velocity as medium
			INITIAL_GAME_VELOCITY = 1/1000;
			game_velocity_type = 1;
		}
	}

	if (currentlyPressedKeys[72]) {
		// 'h' key
		if(!PLAY_GAME){
			// Set game velocity as high
			INITIAL_GAME_VELOCITY = 1/500;
			game_velocity_type = 2;
		}
	}

}
