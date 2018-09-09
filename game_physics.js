//
// Handle the physics of the game
//
// Diogo Ferreira
// Luís Leira
// 2017
//

function jump(elapsed){

	// Decrease velocity at gravity rate
	vY += gravity * (90 * elapsed) / 1000.0;

	// Change height
	ty += vY * (90 * elapsed) / 1000.0;

	// Rotate in the xx axis 90º on jump
	angleXX -= angleRate * (90 * elapsed) / 1000.0;
}

function stopjump(cubesOnSamePosition, maxheightcube){
	
	angleXX = lastXXAngle - 90;

	if(cubesOnSamePosition.length!=0){
		ty = maxheightcube+0.25;
	}
	else{
		ty = -0.5;
		onGround = true;
	}


	vY = 0.0;
}

function inSpeedupZone(){
	for(var j=0; j<speedup.length; j++){

		// Delete the speedups that have pass the cube
		if(tz<speedup[j][2]-(sz+2.5)){
			speedup.splice(j, 1);
			j-=1;
			continue;
		}

		// Else, there is a collision in the ZZ axis!
		// Check if there is a collision on the XX and YY axis.
		if(tz>speedup[j][2]-0.5 && tz<speedup[j][2]+0.5){
			if(tx>speedup[j][0]-0.65 && tx<speedup[j][0]+0.65){
				return true;
			}
		}
	}

	return false;
}

function advanceCube(elapsed){
	// Change cube and maze with translation in ZZ axis

	// The rate at which the cube and maze will advance
	var rate;

	if(inSpeedupZone()){
		rate = elapsed*game_velocity*2;
	}
	else{
		rate = elapsed*game_velocity;
	}

	tz -= rate;
	globalTZZ += rate;
	// Lower the flying obstacles
	for(var i=0; i<flyingobs.length; i++){
		flyingobs[i][1] -= rate;
	}
	
}

function getCubesOnSamePosition(){
	var cubesOnSamePosition = [];

	// Check the cubes that collide with the main cube in the ZZ Axis
	if(mazeCubes != null){

		for(var j=0; j<mazeCubes.length; j++){

			// If cube from maze has already gone relatively to the main cube
			if(tz<mazeCubes[j][2]-sz){
				mazeCubes.splice(j, 1);
				j-=1;
				continue;
			}

			// Maze cube is ahead of main cube
			// It can break loop because all cubes after this one will be further away
			// Maze is ordered by Tz
			if(tz>mazeCubes[j][2]+sz){
				break;
			}

			// Else, there is a collision in the ZZ axis!
			// Check if there is a collision on the XX and YY axis.
			if(tx>mazeCubes[j][0]-sx && tx<mazeCubes[j][0]+sx){
				if(ty>mazeCubes[j][1]-sy && ty<mazeCubes[j][1]+sy){

					// Check if cube is on a new YY value (if it is not on left/right of other cubes)
					var z;
					for(z=0; z<cubesOnSamePosition.length; z++){
						if(mazeCubes[j][1]==cubesOnSamePosition[z][1]) break;
					}
					if(z==cubesOnSamePosition.length)
						cubesOnSamePosition.push(mazeCubes[j]);	
				}
			}
		}
			
	}
	
	return cubesOnSamePosition;
}

// If returns 0: No collision
// If returns 1: Front/Side collision
// If returns 2: Top Collision
function checkCollision(cubes){

	var topCollision = false;
	var frontCollision = false;

	for(var i=0; i<cubes.length; i++){
		
		// Check if the cube is above the maze cube
		if(ty>cubes[i][1]){
			topCollision = true;
		}
		else if(!onGround && vY<-0.1 && onTopOfCube){
			topCollision = true;
		}
		else{
			// Front/Side collision
			frontCollision = true;
		}
	}

	if(frontCollision)
		return 1;
	if(topCollision)
		return 2;
	
	return 0;
}

// Coins collision detection
function getCatchedCoins(){
	var cubeOnCoin = [];

	// Check the coins that collide with the main cube in the ZZ Axis
	if(coins != null){

		for(var j=0; j<coins.length; j++){

			// Delete the coins that have pass the cube
			if(tz<coins[j][2]-(sz+2.5)){
				coins.splice(j, 1);
				j-=1;
				continue;
			}

			// Check if there is a collision on the XX and YY axis and ZZ axis.
			if(tx>coins[j][0]-sx && tx<coins[j][0]+sx){
				if(ty>coins[j][1]-sy && ty<coins[j][1]+sy){
					// ZZ axis is moving to the negative side!
					if(tz<coins[j][2]+sz && ty>coins[j][2]-sz){
						cubeOnCoin.push(j);
					}
					
				}
			}
		}
			
	}
	
	return cubeOnCoin;
}

// Poisonous Coins collision detection
function getCatchedPoisCoins(){
	var cubeOnCoin = [];

	// Check the coins that collide with the main cube in the ZZ Axis
	if(poisCoins != null){

		for(var j=0; j<poisCoins.length; j++){

			// Delete the coins that have pass the cube
			if(tz<poisCoins[j][2]-(sz+2.5)){
				poisCoins.splice(j, 1);
				j-=1;
				continue;
			}

			// Check if there is a collision on the XX and YY axis and ZZ axis.
			if(tx>poisCoins[j][0]-sx && tx<poisCoins[j][0]+sx){
				if(ty>poisCoins[j][1]-sy && ty<poisCoins[j][1]+sy){
					// ZZ axis is moving to the negative side!
					if(tz<poisCoins[j][2]+sz && ty>poisCoins[j][2]-sz){
						cubeOnCoin.push(j);
					}
					
				}
			}
		}
			
	}
	
	return cubeOnCoin;
}


function checkHitFlyingObs(){
	for(var j=0; j<flyingobs.length; j++){
		// Delete the obstacles that have pass the ground
		if(flyingobs[j][1]<-0.70){
			flyingobs.splice(j, 1);
			j-=1;
			continue;
		}

		// Check if there is a collision on the XX and YY axis and ZZ axis.
		if(tx>flyingobs[j][0]-sx && tx<flyingobs[j][0]+sx){
			if(ty>flyingobs[j][1]-sy && ty<flyingobs[j][1]+sy){
				// ZZ axis is moving to the negative side!
				if(tz<flyingobs[j][2]+sz && ty>flyingobs[j][2]-sz){
					return true
				}
				
			}
		}
	}

	return false;
}

function calculateCubeMovement(elapsed){

	if(PLAY_GAME) advanceCube(elapsed);

	// Jump
	if(!onGround) jump(elapsed);

	// Get the position of the maze cubes that are on the same position that the main cube
	var cubesOnSamePosition = getCubesOnSamePosition();

	// Get the position of the coins that are on the same position that the main cube
	var coinsCatched = getCatchedCoins();

	// For every coin that is in the same position that the cube,
	// remove it and add 10 points.
	for(var i=0; i<coinsCatched.length; i++){
		// bonus score depending on the initial game velocity
		score += 10+(game_velocity_type * 2);
		coins.splice(coinsCatched[i], 1);
	}

	// Get the position of the poisonous coins that are on the same position that the main cube
	var poisCoinsCatched = getCatchedPoisCoins();

	// For every coin that is in the same position that the cube,
	// remove it and remove 10 points.
	for(var i=0; i<poisCoinsCatched.length; i++){
		// bonus score depending on the initial game velocity
		score -= 10+(game_velocity_type * 2);
		if(score<0)
			score = 0;
		poisCoins.splice(poisCoinsCatched[i], 1);
	}

	// Check if the main cube hit a flying obstacle
	var hitf = checkHitFlyingObs();

	// If it did, reset the game
	if(hitf){
		reset();
		PLAY_GAME = false;
	}

	// Get the highest cube
	var maxheightcube = -999;
	for(var i=0; i<cubesOnSamePosition.length; i++){
		if(maxheightcube<cubesOnSamePosition[i][1])
			maxheightcube = cubesOnSamePosition[i][1];
	}
	
	// Check if there is a collision
	collision_code = checkCollision(cubesOnSamePosition);


	// If is on top of cube but there is no collision, is no longer on top of cube
	if(onTopOfCube && collision_code!=2){
		onTopOfCube = false;
	}

	// Front collision
	if(collision_code==1){
		reset();
		PLAY_GAME = false;
	}
	// Top collision
	else if(collision_code==2){
		onTopOfCube = true;
		ty = maxheightcube+0.25;
		vY = 0.0;
		angleXX = lastXXAngle - 90;
	}

	// Stop jump if cube is not on ground and it is below the level of the higher cube (if exists)
	if(!onGround && ((ty<-0.5 && cubesOnSamePosition.length==0) || (cubesOnSamePosition.length!=0 && ty<maxheightcube+0.25))){
		stopjump(cubesOnSamePosition, maxheightcube);
	} 

}


