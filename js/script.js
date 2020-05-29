{//Shader
var vs = `#version 300 es

in vec3 inPosition;
in vec3 inNormal;
out vec3 fsNormal;

uniform mat4 matrix;

void main() {
  fsNormal =  inNormal;
  gl_Position = matrix * vec4(inPosition, 1.0);
}`;

var fs = `#version 300 es

precision mediump float;

in vec3 fsNormal;
out vec4 outColor;

uniform vec3 mDiffColor;
uniform vec3 lightDirection;
uniform vec3 lightColor;

void main() {

  vec3 nNormal = normalize(fsNormal);
  vec3 lDir = (lightDirection);
  vec3 lambertColor = mDiffColor * lightColor * dot(-lDir,nNormal);
  outColor = vec4(clamp(lambertColor, 0.0, 1.0), 1.0);
}`;
}

function main(){
    var program = null;
    var object_matrix = new Array();

    // Sphere definition
    object_matrix[0] = utils.MakeWorld( 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 1.0);
    var ballMaterialColor = [0.5, 0.5, 0.5];

    // Table
    object_matrix[1] = utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0);
    var tableMaterialColor = [0.5, 0.5, 0.5];

    {//Light
    var dirLightAlpha = -utils.degToRad(120);
    var dirLightBeta  = -utils.degToRad(0);

    var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha),
              Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
              ];
    var directionalLightColor = [0.1, 1.0, 1.0];}

    //Draw 3D objects
    var [b_vertices, b_normals, b_indices] = draw_ball();
    var [t_vertices, t_normals, t_indices] = draw_par(15.0, 0.5, 20.0);

    //For animation
    /*var lastUpdateTime = (new Date).getTime();*/

    {//Canvas
    var canvas = document.getElementById("c");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);}

    //Shader
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vs);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fs);
    var program = utils.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    //Program settings
    var positionAttributeLocation = gl.getAttribLocation(program, "inPosition");
    var normalAttributeLocation = gl.getAttribLocation(program, "inNormal");
    var matrixLocation = gl.getUniformLocation(program, "matrix");
    var materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
    var lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
    var lightColorHandle = gl.getUniformLocation(program, 'lightColor');
    var perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, 0.1, 100.0);

    {//Passing ball's params to shader
    var b_vao = gl.createVertexArray();
    gl.bindVertexArray(b_vao);
    var b_positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b_positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(b_vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var b_normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(b_normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var b_indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b_indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(b_indices), gl.STATIC_DRAW);}

    {//Passing table's params to shader
    var t_vao = gl.createVertexArray();
    gl.bindVertexArray(t_vao);
    var t_positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, t_positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(t_vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var t_normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, t_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(t_normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var t_indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, t_indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(t_indices), gl.STATIC_DRAW);
}

    // Camera setting
    var viewMatrix = utils.MakeView(0.0, 10.0, 25.0, -30.0, 0.0);

    {//Ball rendering
    var worldViewMatrix = utils.multiplyMatrices(viewMatrix, object_matrix[0]);
    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);

    //need to transform light differently for each object
    // inverse transpose of the inverse of the world matrix is just the transpose
    var lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(object_matrix[0]));
    var directionalLightTransformed = utils.normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLight));
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

    gl.uniform3fv(materialDiffColorHandle, ballMaterialColor);

    gl.uniform3fv(lightColorHandle,  directionalLightColor);
    gl.uniform3fv(lightDirectionHandle,  directionalLightTransformed);

    gl.bindVertexArray(b_vao);
    gl.drawElements(gl.TRIANGLES, b_indices.length, gl.UNSIGNED_SHORT, 0 );
}

    {//Table rendering
    worldViewMatrix = utils.multiplyMatrices(viewMatrix, object_matrix[1]);
    projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);
    lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(object_matrix[1]));
    directionalLightTransformed = utils.normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLight));
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

    gl.uniform3fv(materialDiffColorHandle, tableMaterialColor);

    gl.uniform3fv(lightColorHandle,  directionalLightColor);
    gl.uniform3fv(lightDirectionHandle,  directionalLightTransformed);

    gl.bindVertexArray(t_vao);

    gl.drawElements(gl.TRIANGLES, t_indices.length, gl.UNSIGNED_SHORT, 0 );
}

    // drawScene();

  //   function animate(){
  //       var currentTime = (new Date).getTime();
  //       if(lastUpdateTime){
  //           var deltaX = (30 * (currentTime - lastUpdateTime)) / 1000.0;
  //
  //           ballX += deltaX;
  //           ballY += deltaY;
  //           ballZ += deltaZ;
  //
  //
  //   }
  //   cubeWorldMatrix[3] = utils.MakeWorld( 0.0, 0.0, 0.0, cubeRx, cubeRy, cubeRz, cubeS);
  //
  //   lastUpdateTime = currentTime;
  // }

}

main();
