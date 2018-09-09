//////////////////////////////////////////
//
//	Impossible game 3D
//
//	1º Projeto CV 2017-2018
//
//	Diogo Daniel Soares Ferreira Nº 76504
//	Luís Davide Jesus Leira Nº 76514
//
///////////////////////////////////////////

var PLAY_GAME = false;

// Velocity of the cube and the maze
var INITIAL_GAME_VELOCITY = 1/1000;
var game_velocity_type = 1;

var game_velocity = INITIAL_GAME_VELOCITY;

var gl = null; // WebGL context
var shaderProgram = null;

var cubeVertexPositionBuffer = null;
var cubeVertexNormalBuffer = null;
var cubeVertexIndexBuffer = null;
var cubeVertexTextureCoordBuffer = null;

var coinVertexPositionBuffer = null;
var coinVertexNormalBuffer = null;
var coinVertexIndexBuffer = null;

var globalXXAngle = 0;
var globalYYAngle = 0;
var globalZZAngle = 0;

var variationGlobalTZZ = 0.0;

var globalTXX = 0.0;
var globalTYY = 0.0;
var globalTZZ = -2.5;
var tx = 0.0;
var ty = -0.5;
var tz = 0.0;

var angleXX = 0.0;
var angleYY = 0.0;
var angleZZ = 0.0;

var lastXXAngle = 0.0;

var anglecoins = 0.0;

var sx = 0.25;
var sy = 0.25;
var sz = 0.25;

// Velocity of y
var vY = 0.0;

var gravity = -0.01;
var onGround = true;
var onTopOfCube = false;

var fovy = 55;
var aspect = 1;
var near = 0.05;
var far = 15;

var angleRate = 3;

// Pos Viewer for perspective projection
var pos_Viewer = [ 0.0, 0.0, 0.0, 1.0 ];

var origmaze = [];
var maze = [];
var mazeCubes = [];

var coins = [];
var poisCoins = [];
var speedup = [];
var flyingobs = [];

// Current Score
var score = 0;

// Generates one speedup zone for each x steps
var step=5;

// High score
var highscore = 0;

var lastTime = 0;

// Texture2
var webGLTexture1;
var webGLTexture2;


function updateScore() {
	
	document.getElementById('score').innerHTML = Math.floor(score);
	if(score >= highscore){
		highscore = score;
		document.getElementById('highscore').innerHTML = Math.floor(highscore);
	}
}

function drawMaze(mvMatrix){
	for(var i=0; i<maze.length; i++){

		drawMazeCube( 0, 0, 0, 
	           sx, sy, sz,
	           maze[i][0], maze[i][1], maze[i][2],
	           mvMatrix);
	}
}

function drawCoins(mvMatrix){
	setUpCoin();
	// Draw regular coins
	for(var i=0; i<coins.length; i++){
		drawCoin(0, anglecoins, 0,
				0.1, 0.1, 0.1,
				coins[i][0], coins[i][1], coins[i][2],
				mvMatrix);
	}

	// Draw poisonous coins
	for(var i=0; i<poisCoins.length; i++){
		drawPoisCoin(0, -anglecoins, 0,
				0.1, 0.1, 0.1,
				poisCoins[i][0], poisCoins[i][1], poisCoins[i][2],
				mvMatrix);
	}

	setUpCube();
}


function drawFloor(mvMatrix){
	var bool = true;

	// Variable that stores the size of the squares that form the ground
	// A lower number will imply more loops, and a slower game
	var sq = 1;

	// Offset to calculate the "future" maze.
	// It will not generate the complete maze, only the needed part.
	// Round to the nearest even for a soft transition
	var offset = Math.floor(-tz/(2*sq))*(2*sq);


	for(var i=-20-offset; i<2.5-offset; i+=sq){
		bool = !bool;
		for(var j=-10; j<10; j+=sq){
			if(bool){
				drawFloorSquare(
							floorColor,
							0, 0, 0, 
	           				sq, 0, sq,
	           				j, -0.70, i,
	           				mvMatrix);
			}
			bool = !bool;
			
		}
	}
}

function drawSpeedupZones(mvMatrix){
	var sq = 1;

	for(var i=0; i<speedup.length; i++){
		drawFloorSquare(
						speedupColor,
						0, 0, 0, 
	           			sq, 0, sq,
	           			speedup[i][0], speedup[i][1], speedup[i][2],
	           			mvMatrix);
	}
}

function drawFlyingObstacles(mvMatrix){
	for(var i=0; i<flyingobs.length; i++){

		drawFlyingObstacle( 0, 0, 0, 
	           sx, sy, sz,
	           flyingobs[i][0], flyingobs[i][1], flyingobs[i][2],
	           mvMatrix);
	}
}

function drawScene(){
	var pMatrix;
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.clearColor(0, 0, 0, 0.15);
	pMatrix = perspective( fovy, aspect, near, far );
	
	mvMatrix = applyGlobalTransformations(pMatrix);
	updateLightSources();

	
	
	drawMaze(mvMatrix);
	drawMainCube( 
			angleXX, angleYY, angleZZ, 
	        sx, sy, sz,
	        tx, ty, tz,
	        mvMatrix);
	drawSpeedupZones(mvMatrix);
	drawFloor(mvMatrix);
	drawFlyingObstacles(mvMatrix);
	drawCoins(mvMatrix);
}

function applyGlobalTransformations(pMatrix){
	var mvMatrix = mat4();

	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
	gl.uniform4fv( gl.getUniformLocation(shaderProgram, "viewerPosition"), flatten(pos_Viewer) );

	mvMatrix = mult(rotationYYMatrix(globalYYAngle),
					rotationXXMatrix(globalXXAngle));

	mvMatrix = mult(mvMatrix, rotationZZMatrix(globalZZAngle))
	mvMatrix = mult(mvMatrix, translationMatrix( globalTXX, globalTYY, globalTZZ+variationGlobalTZZ ));

	return mvMatrix;
}

// Updating the position of the light sources, if required
function updateLightSources(){

	var j = 0;
	    
	for(var i = 0; i < lightSources.length; i++ )
	{
		if( lightSources[i].isOff() ) {
			continue;
		}

		// Animating the light source, if defined
		    
		var lightSourceMatrix = mat4();
		    
		if( lightSources[i].isRotXXOn() ) 
		{
			lightSourceMatrix = mult( 
					lightSourceMatrix, 
					rotationXXMatrix( lightSources[i].getRotAngleXX() ) );
		}

		if( lightSources[i].isRotYYOn() ) 
		{
			lightSourceMatrix = mult( 
					lightSourceMatrix, 
					rotationYYMatrix( lightSources[i].getRotAngleYY() ) );
		}

		if( lightSources[i].isRotZZOn() ) 
		{
			lightSourceMatrix = mult( 
					lightSourceMatrix, 
					rotationZZMatrix( lightSources[i].getRotAngleZZ() ) );
		}

		// Passing the Light Souree Matrix to apply
	
		var lsmUniform = gl.getUniformLocation(shaderProgram, "allLights["+ String(j) + "].lightSourceMatrix");
		gl.uniformMatrix4fv(lsmUniform, false, new Float32Array(flatten(lightSourceMatrix)));
		j++;
	}
}

// Reset the scene variables to the beginning of the game
function reset(){
	tx = 0.0;
	ty = -0.5;
	tz = 0.0;
	vY = 0;
	globalTZZ = -2.5;
	score = 0;
	game_velocity = INITIAL_GAME_VELOCITY;

	// Put all cubes on the maze
	maze = origmaze.slice();

	// If the maze is too short, extend it
	while(maze[maze.length-1][2]>globalTZZ-far){
		var end = maze[maze.length-1][2];
		for(var i=0; i<origmaze.length; i++){
			maze.push([origmaze[i][0], origmaze[i][1], origmaze[i][2]+end]);
		}
	}
	
	// Generate coins
	coins = [];
	generateCoins(maze);

	// Generate poisonous coins
	poisCoins = [];
	generatePoisonousCoins(maze);

	// Generate flying obstacles
	flyingobs = [];
	generateFlyingObstacles(maze);

	// Generate speedup zones
	speedup = [];
	generateSpeedUpZones(maze);

	// Copy the maze for detecting collisions more efficiently
	mazeCubes = maze.slice();

	// No cubes on the same position
	numberOfCubesOnPosition = 0;
	
	PLAY_GAME = false;
}


document.getElementById("file").onchange = function(){
		
	var file = this.files[0];
	var reader = new FileReader();
		
	reader.onload = function( progressEvent ){
    
		var tokens = this.result.split(/\s\s*/);
		var numCubes = parseInt( tokens[0] );
		var i, j;
		var aux = 1;
		var newBlock = [];
		var mazeTx, mazeTy, mazeTz;

		origmaze = [];
			
		for( i = 0; i < numCubes; i++ ) {

			mazeTx = parseFloat(tokens[aux++]);
			mazeTy = parseFloat(tokens[aux++]);
			mazeTz = parseFloat(tokens[aux++]);

			// Insert the cube ordered by the ZZ axis translation
			// It will ease the erase of cubes not used
			// To detect collision only on the next cubes

			var j=0;
			for(var j=0; j<origmaze.length; j++){
				if(origmaze[j][2]<mazeTz) break;
			}
			origmaze.splice(j, 0, [mazeTx, mazeTy, mazeTz]);
				
		}

		reset();

	};
		
	// Entire file read as a string
	reader.readAsText( file );
	highscore = 0;
	
}


function generateCoins(newMaze){
	
	var arrayMoves = [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75];
	var arrayMovesY = [0, 0.25, 0.5, 0.75];
	var coinX, coinY, coinZ;

	for(var i = 0; i < newMaze.length; i++) {
		// Generate coins - in less quantity than cubes from the maze
		if(i % 10 == 0){
			randX = arrayMoves[Math.floor(Math.random() * arrayMoves.length)];
			randZ = arrayMoves[Math.floor(Math.random() * arrayMoves.length)];
			randY = arrayMovesY[Math.floor(Math.random() * arrayMovesY.length)];
						

			coinX = newMaze[i][0]+randX;
			coinY = newMaze[i][1]+randY;
			coinZ = newMaze[i][2]+randZ;

			if(randX == 0 && randZ == 0){
				coinY = newMaze[1][1]+0.25;
			}

			if(coinX > 1){
				coinX = 1
			}
			if(coinX < -1){
				coinX = -1
			}

			coins.push([coinX, coinY, coinZ]);
		}
	}
}


function generateSpeedUpZones(newMaze){
	var arrayMoves = [-1.0, 0.0, 1.0];

	// Get end of maze
	var end = newMaze[newMaze.length-1][2];
	var beg = Math.floor(newMaze[0][2]);

	for(var z=beg; z>end; z-=step){
		speedup.push([arrayMoves[Math.floor(Math.random() * arrayMoves.length)], -0.70, z-Math.floor(Math.random()*step)]);
	}
}

// Extends the current maze
function appendMaze(){

	var newCubes = [];

	// If the maze is too short, extend it
	while(maze[maze.length-1][2]>tz-far){
		var end = maze[maze.length-1][2];
		for(var i=0; i<origmaze.length; i++){
			var newCube = [origmaze[i][0], origmaze[i][1], origmaze[i][2]+(tz-far)];
			newCubes.push(newCube);
			maze.push(newCube);
			mazeCubes.push(newCube);
		}
	}

	if(newCubes.length>0){
		generatePoisonousCoins(newCubes);
		generateFlyingObstacles(newCubes);
		generateSpeedUpZones(newCubes);
		generateCoins(newCubes);
	}
	
}

// Cleans the maze that has already gone from the viewport
function cleanPastMaze(){
	for(var i=0; i<maze.length; i++){
		if(maze[i][2]>tz+2.5){
			maze.splice(i, 1);
			i-=1;
			continue;
		}
	}
}

function generatePoisonousCoins(newMaze){
	var arrayMoves = [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75];
	var arrayMovesY = [0, 0.25, 0.5, 0.75];
	var coinX, coinY, coinZ;

	for(var i = 0; i < newMaze.length; i++) {
		// Generate coins - in less quantity than cubes from the maze
		if(i % 20 == 0){
			randX = arrayMoves[Math.floor(Math.random() * arrayMoves.length)];
			randZ = arrayMoves[Math.floor(Math.random() * arrayMoves.length)];
			randY = arrayMovesY[Math.floor(Math.random() * arrayMovesY.length)];
						

			coinX = newMaze[i][0]+randX;
			coinY = newMaze[i][1]+randY;
			coinZ = newMaze[i][2]+randZ;

			if(randX == 0 && randZ == 0){
				coinY = newMaze[1][1]+0.25;
			}

			if(coinX > 1){
				coinX = 1
			}
			if(coinX < -1){
				coinX = -1
			}

			poisCoins.push([coinX, coinY, coinZ]);
		}
	}
}

function generateFlyingObstacles(newMaze){

	// YY and ZZ distance from the actual cube
	distance = Math.floor(Math.random()*15) + 2;
	// XX value of the obstacle
	xValue = Math.random()*2-1;
	flyingobs.push([xValue, ty+distance, tz-distance]);
}

function animate() {
	
	var timeNow = new Date().getTime();
	
	if(lastTime != 0) {
		var elapsed = timeNow - lastTime;

		calculateCubeMovement(elapsed);
		
		// Check if maze needs to be extended
		if(maze.length>0 && maze[maze.length-1][2]>tz-globalTZZ-far){
			appendMaze();
			game_velocity += 1/1000000;
		}

		if(PLAY_GAME){

			// Rotating the light sources
	
			for(var i = 0; i < lightSources.length; i++ )
		    {
		    	if( lightSources[i].isOff() ) {
					continue;
				}

				if( lightSources[i].isRotXXOn() ) {
					var angle = lightSources[i].getRotAngleXX() + lightSources[i].getRotationSpeed() * (90 * elapsed) / 1000.0;
					lightSources[i].setRotAngleXX( angle );
				}

				if( lightSources[i].isRotYYOn() ) {
					var angle = lightSources[i].getRotAngleYY() + lightSources[i].getRotationSpeed() * (90 * elapsed) / 1000.0;
					lightSources[i].setRotAngleYY( angle );
				}

				if( lightSources[i].isRotZZOn() ) {
					var angle = lightSources[i].getRotAngleZZ() + lightSources[i].getRotationSpeed() * (90 * elapsed) / 1000.0;
					lightSources[i].setRotAngleZZ( angle );
				}
			}
		}

		// Rotate coins
		anglecoins += (90*elapsed)/1000.0;
	}
	
	lastTime = timeNow;
	cleanPastMaze();
}


function tick() {
	
	requestAnimFrame(tick);
	handleKeys();
	drawScene();
	animate();
	updateScore();
}

function setEventListeners(canvas){

	canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
	document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    // On firefox browser
    document.onwheel = handleMouseWheel;
    // On chrome browser
    document.onmousewheel = handleMouseWheel;

	document.getElementById("startbutton").onclick = function(){
		if(maze.length>0){
			// Switching on the game
			PLAY_GAME = true;
			game_velocity = INITIAL_GAME_VELOCITY;
		}
		

	};

	document.getElementById("restartbutton").onclick = function(){
		// Restart the game
		reset();

	};

	document.getElementById("lowspeed").onclick = function(){
		if(!PLAY_GAME){
			// Set game velocity as low
			INITIAL_GAME_VELOCITY = 1/10000;
			game_velocity_type = 0;
		}

	};

	document.getElementById("medspeed").onclick = function(){
		if(!PLAY_GAME){
			// Set game velocity as low
			INITIAL_GAME_VELOCITY = 1/1000;
			game_velocity_type = 1;
		}

	};

	document.getElementById("highspeed").onclick = function(){
		if(!PLAY_GAME){
			// Set game velocity as low
			INITIAL_GAME_VELOCITY = 1/500;
			game_velocity_type = 2;
		}

	};

}

function initWebGL( canvas ) {
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		
		gl.enable( gl.CULL_FACE );
		gl.cullFace( gl.BACK );

		gl.enable( gl.DEPTH_TEST );

		
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}        
}

function runWebGL() {
	var canvas = document.getElementById("my-canvas");
	initWebGL( canvas );
	shaderProgram = initShaders( gl );
	setEventListeners( canvas );
	initBuffers();
	initTexture();
	tick();
}
