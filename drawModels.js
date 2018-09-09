//
// Functions to draw the models
//
// Diogo Ferreira
// Luís Leira
// 2017


function drawMainCube( 
	angleXX, angleYY, angleZZ, 
	sx, sy, sz,
	tx, ty, tz,
	 mvMatrix){

	applyMatrix(angleXX, angleYY, angleZZ, sx, sy, sz, tx, ty, tz, mvMatrix);
    applyPhongIlluminationModel(kAmbiMainCube, kDiffMainCube, kSpecMainCube, nPhongMainCube);
    // Do not apply texture
    gl.uniform1f( gl.getUniformLocation(shaderProgram, "textureCoef"), 0.0 );

	// Drawing
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawMazeCube(
	angleXX, angleYY, angleZZ, 
	sx, sy, sz,
	tx, ty, tz,
	mvMatrix){

	applyMatrix(angleXX, angleYY, angleZZ, sx, sy, sz, tx, ty, tz, mvMatrix);
	applyPhongIlluminationModel(kAmbiMazeCube, kDiffMazeCube, kSpecMazeCube, nPhongMazeCube);

	// Apply texture
	gl.uniform1f( gl.getUniformLocation(shaderProgram, "textureCoef"), 0.7 );
	gl.bindTexture(gl.TEXTURE_2D, webGLTexture1);

	// Drawing 
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawFloorSquare(color,
	angleXX, angleYY, angleZZ, 
	sx, sy, sz,
	tx, ty, tz,
	mvMatrix){

	applyMatrix(angleXX, angleYY, angleZZ, sx, sy, sz, tx, ty, tz, mvMatrix);
	applyColor(color);
	// Do not apply texture
	gl.uniform1f( gl.getUniformLocation(shaderProgram, "textureCoef"), 0.0 );


	// Drawing only the top face
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 24);
}

function drawCoin(angleXX, angleYY, angleZZ, 
	sx, sy, sz,
	tx, ty, tz,
	mvMatrix){

	applyMatrix(angleXX, angleYY, angleZZ, sx, sy, sz, tx, ty, tz, mvMatrix);
	applyPhongIlluminationModel(kAmbiCoin, kDiffCoin, kSpecCoin, nPhongCoin);
	// Do not apply texture
	gl.uniform1f( gl.getUniformLocation(shaderProgram, "textureCoef"), 0.0 );

	// Drawing 
	gl.drawElements(gl.TRIANGLES, coinVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawPoisCoin(angleXX, angleYY, angleZZ, 
	sx, sy, sz,
	tx, ty, tz,
	mvMatrix){

	applyMatrix(angleXX, angleYY, angleZZ, sx, sy, sz, tx, ty, tz, mvMatrix);
	applyPhongIlluminationModel(kAmbiPoisCoin, kDiffPoisCoin, kSpecPoisCoin, nPhongPoisCoin);
	// Do not apply texture
	gl.uniform1f( gl.getUniformLocation(shaderProgram, "textureCoef"), 0.0 );

	// Drawing 
	gl.drawElements(gl.TRIANGLES, coinVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawFlyingObstacle(angleXX, angleYY, angleZZ, 
	sx, sy, sz,
	tx, ty, tz,
	mvMatrix){

	applyMatrix(angleXX, angleYY, angleZZ, sx, sy, sz, tx, ty, tz, mvMatrix);
	applyPhongIlluminationModel(kAmbiFlyObj, kDiffFlyObj, kSpecFlyObj, nPhongFlyObj);
	// Apply texture
	gl.uniform1f( gl.getUniformLocation(shaderProgram, "textureCoef"), 0.7 );
	gl.bindTexture(gl.TEXTURE_2D, webGLTexture2);
    
	// Drawing 
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

// Auxiliary Functions

function applyMatrix(angleXX, angleYY, angleZZ, 
	sx, sy, sz,
	tx, ty, tz,
	mvMatrix){

	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );
	mvMatrix = mult( mvMatrix, rotationZZMatrix( angleZZ ) );
	mvMatrix = mult( mvMatrix, rotationYYMatrix( angleYY ) );
	mvMatrix = mult( mvMatrix, rotationXXMatrix( angleXX ) );
	mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );

	// Passing the Model View Matrix to apply the current transformation

	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
}

function applyPhongIlluminationModel(kAmbi, kDiff, kSpec, nPhong){

	// Use phong illumination model
	gl.uniform1i( gl.getUniformLocation(shaderProgram, "colortype"), 1 );

	// Material properties
	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_ambient"), flatten(kAmbi) );
	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_diffuse"), flatten(kDiff) );
	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_specular"), flatten(kSpec) );
	gl.uniform1f( gl.getUniformLocation(shaderProgram, "shininess"), nPhong);

	// Light Sources
	var numLights = lightSources.length;
	gl.uniform1i( gl.getUniformLocation(shaderProgram, "numLights"), 
		numLights );

	var j = 0;
	
	for(var i = 0; i < lightSources.length; i++ )
	{

		if( lightSources[i].isOff() ) {
			continue;
		}

		gl.uniform4fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(j) + "].position"), flatten(lightSources[i].getPosition()) );
		gl.uniform3fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(j) + "].intensities"), flatten(lightSources[i].getIntensity()) );

		j++;
    }
}

function applyColor(color){
	// Use specified color
	gl.uniform1i( gl.getUniformLocation(shaderProgram, "colortype"), 0 );
	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "vertexColor"), flatten(color) );
}

function handleLoadedTexture(texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function initTexture() {
	
	webGLTexture1 = gl.createTexture();
	webGLTexture1.image = new Image();
	webGLTexture1.image.onload = function () {
		handleLoadedTexture(webGLTexture1)
	}
	webGLTexture1.image.crossOrigin = "";
	webGLTexture1.image.src = "https://i.imgur.com/9Se16BR.jpg";


	webGLTexture2 = gl.createTexture();
	webGLTexture2.image = new Image();
	webGLTexture2.image.onload = function () {
		handleLoadedTexture(webGLTexture2)
	}
	webGLTexture2.image.crossOrigin = "";
	webGLTexture2.image.src = "https://i.imgur.com/yAf53KU.jpg";

}

