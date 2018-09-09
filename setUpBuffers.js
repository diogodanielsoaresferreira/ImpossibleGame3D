//
// Set up buffers for WebGL Internal stats
//
// Diogo Ferreira
// Luís Leira
// 2017


function initBuffers() {
		
	// Cube Coordinates
	cubeVertexPositionBuffer = gl.createBuffer();
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = cubevertices.length / 3;			
	
	// Cube Vertex Normal Vectors
	cubeVertexNormalBuffer = gl.createBuffer();
	cubeVertexNormalBuffer.itemSize = 3;
	cubeVertexNormalBuffer.numItems = cubenormals.length / 3;

	// Cube Vertex indices
    cubeVertexIndexBuffer = gl.createBuffer();
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = cubeVertexIndices.length;

    // Coin Coordinates
	coinVertexPositionBuffer = gl.createBuffer();
	coinVertexPositionBuffer.itemSize = 3;
	coinVertexPositionBuffer.numItems = coinvertices.length / 3;			
	
	// Coin Vertex Normal Vectors
	coinVertexNormalBuffer = gl.createBuffer();
	coinVertexNormalBuffer.itemSize = 3;
	coinVertexNormalBuffer.numItems = coinnormals.length / 3;

	// Coin Vertex indices
    coinVertexIndexBuffer = gl.createBuffer();
    coinVertexIndexBuffer.itemSize = 1;
    coinVertexIndexBuffer.numItems = coinVertexIndices.length;
	
	// Textures
    cubeVertexTextureCoordBuffer = gl.createBuffer();
    cubeVertexTextureCoordBuffer.itemSize = 2;
    
	setUpCube();

}

function setUpCube(){

	// Set up cube coordinate
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubevertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
		cubeVertexPositionBuffer.itemSize, 
		gl.FLOAT, false, 0, 0);


	// Set up cube normals
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubenormals), gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
		cubeVertexNormalBuffer.itemSize, 
		gl.FLOAT, false, 0, 0);

	// Set up cube texture coordinates
	cubeVertexTextureCoordBuffer.numItems = textureCoords.length/2;
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    // Set up cube vertex index
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
}

function setUpCoin(){

	// Set up coin coordinate
	gl.bindBuffer(gl.ARRAY_BUFFER, coinVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coinvertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
		coinVertexPositionBuffer.itemSize, 
		gl.FLOAT, false, 0, 0);

	// Set up coin normals
	gl.bindBuffer(gl.ARRAY_BUFFER, coinVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coinnormals), gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
		coinVertexNormalBuffer.itemSize, 
		gl.FLOAT, false, 0, 0);

	// Set up "Dumb" texture array for coin
	// Because it needs to have the same size as the vertices length*(2/3)
	cubeVertexTextureCoordBuffer.numItems = textureCoordsCoin.length/2;
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordsCoin), gl.STATIC_DRAW);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Set up coin vertex index
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coinVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(coinVertexIndices), gl.STATIC_DRAW);
}
