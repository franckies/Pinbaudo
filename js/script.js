{//Global variables
var  canvas;
var gl = null;
var program = null;

var object_matrix = new Array();
var b_vao, t_vao, p_vao, wLR_vao, wUD_vao;
var b_indices, t_indices, p_indices, wLR_indices, wUD_indices;
var b_vertices, t_vertices, p_vertices, wLR_vertices, wUD_vertices;
var b_normals, t_normals, p_normals, wLR_normals, wUD_normals;

var lastUpdateTime, currentTime;

var matrixLocation;
var perspectiveMatrix, projectionMatrix, viewMatrix;

var directionalLight;
var lightColorHandle;
var lightDirectionHandle;
var materialDiffColorHandle;

//animation variables
var p1_rot = -45.0;
var p2_rot = -45.0;
var z_ball = -20.0;
var deltaz_ball = 0.0;
//Camera

var cx = 0.0;
var cy = 10.0;
var cz = 25.0;
var camx = null;
var camy = null;
}

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
uniform float alpha;

void main() {

  vec3 nNormal = normalize(fsNormal);
  vec3 lDir = (lightDirection);
  vec3 lambertColor = mDiffColor * lightColor * dot(-lDir,nNormal);
  outColor = vec4(clamp(lambertColor, 0.0, 1.0), alpha);
}`;
}

function main(){

    {//Lights
    var dirLightAlpha = -utils.degToRad(90);
    var dirLightBeta  = -utils.degToRad(0);

    directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha),
              Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
              ];
    directionalLightColor = [0.1, 1.0, 1.0];}

    {//Object construction
    var ball = new dynBall(draw_ball(), [0.2, 0.2, 1.0]);
    var table = new Item(draw_par(15.0, 0.5, 20.0), [1.0, 0.65, 0.0]);
    var paletteL = new Item(draw_par(3.0, 0.3, 1.0), [1.0, 1.0, 1.0]);
    var paletteR = new Item(draw_par(3.0, 0.3, 1.0), [1.0, 1.0, 1.0]);
    var wallL = new Item(draw_par(1.0 ,1.0 ,20.0), [1.0, 0.65, 0.0]);
    var wallR = new Item(draw_par(1.0 ,1.0 ,20.0), [1.0, 0.65, 0.0]);
    var wallU = new Item(draw_par(13.0 ,1.0, 0.5), [1.0, 0.65, 0.0]);
    var wallD = new Item(draw_par(13.0 ,1.0 ,0.5), [1.0, 0.65, 0.0]);
  }

    //Objects position, rotation, scaling and color definition
    // Sphere
    ball.set_vel([0.0, 0.0, 0.0]);
    // Table
    table.set_pos(utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0));
    //wall
    wallL.set_pos(utils.MakeWorld(-14.0, 1.5, 0.0, 0.0, 0.0, 0.0, 1.0));
    wallR.set_pos(utils.MakeWorld(14.0, 1.5, 0.0, 0.0, 0.0, 0.0, 1.0));
    wallU.set_pos(utils.MakeWorld(0.0, 1.5, -19.5, 0.0, 0.0, 0.0, 1.0));
    wallD.set_pos(utils.MakeWorld(0.0, 1.5, 19.5, 0.0, 0.0, 0.0, 1.0));

    //For animation
    var deltaT;
    var lastUpdateTime = (new Date).getTime();

    {//Canvas
    canvas = document.getElementById("c");
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

    // TEST
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    //gl.enable(gl.BLEND);
    //gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //

    {//Program settings
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vs);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fs);
    program = utils.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);


    var positionAttributeLocation = gl.getAttribLocation(program, "inPosition");
    var normalAttributeLocation = gl.getAttribLocation(program, "inNormal");
    matrixLocation = gl.getUniformLocation(program, "matrix");
    materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
    lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
    lightColorHandle = gl.getUniformLocation(program, 'lightColor');
    perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, 0.1, 100.0);}
    alphaLocation = gl.getUniformLocation(program, 'alpha');

    {//Passing ball's params to shader
    b_vao = gl.createVertexArray();
    gl.bindVertexArray(b_vao);
    var b_positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b_positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ball.vert), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var b_normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ball.norm), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var b_indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b_indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ball.ind), gl.STATIC_DRAW);}

    {//Passing table's params to shader
    t_vao = gl.createVertexArray();
    gl.bindVertexArray(t_vao);
    var t_positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, t_positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(table.vert), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var t_normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, t_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(table.norm), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var t_indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, t_indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(table.ind), gl.STATIC_DRAW);
}

    {//Passing palette's params to Shader
    p_vao = gl.createVertexArray();
    gl.bindVertexArray(p_vao);
    var p_positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, p_positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(paletteR.vert), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var p_normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, p_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(paletteR.norm), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var p_indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p_indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(paletteR.ind), gl.STATIC_DRAW);}

    {//Passing walls LEFT-RIGHT params to Shader
    wLR_vao = gl.createVertexArray();
    gl.bindVertexArray(wLR_vao);
    var wLR_positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, wLR_positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wallL.vert), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var wLR_normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, wLR_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wallL.norm), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var wLR_indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wLR_indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(wallL.ind), gl.STATIC_DRAW);}

    {//Passing walls UP-DOWN params to SHADER
    wUD_vao = gl.createVertexArray();
    gl.bindVertexArray(wUD_vao);
    var wUD_positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, wUD_positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wallU.vert), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var wUD_normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, wUD_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wallU.norm), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var wUD_indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wUD_indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(wallU.ind), gl.STATIC_DRAW);}

    drawScene();

    //Function to handle animation
    function animate(){
    currentTime = (new Date).getTime();
    deltaT = currentTime - lastUpdateTime;


    // Camera movement

    if (lastUpdateTime){
        if (camx !== null) {
            if (camx) {
                cx += 30 * deltaT / 1000.0;
            } else {
                cx -= 30 * deltaT / 1000.0
            }
        }

        if (camy !== null) {
            if (camy) {
                cy += 30.0 * deltaT / 1000.0;
            } else if (!camy) {
                cy -= 30.0 * deltaT / 1000.0;
            }
        }

        camx = null;
        camy = null;
    }


    {//Ball Animation
    //Gravity update
    if(lastUpdateTime){
      ball.gravity_update(deltaT);
      deltaz_ball = (ball.vel[2]*deltaT) / 1000.0;
      z_ball += deltaz_ball;
    }

    ball.set_pos(utils.MakeWorld(0.0, 1.5, z_ball, 0.0, 0.0, 0.0, 1.0));}

    {//Palette Animation
    let deltaR = (350 * deltaT) / 1000.0;
    if(lastUpdateTime){
        p1_rot = (p1UP)? (Math.min(30, p1_rot+deltaR)):(Math.max(-45, p1_rot-deltaR));
        p2_rot = (p2UP)? (Math.min(30, p2_rot+deltaR)):(Math.max(-45, p2_rot-deltaR))
    }

    paletteL.set_pos(utils.multiplyMatrices(utils.MakeWorld(-4.2, 2.0, 16.5, 0.0, 0.0, 0.0, 1.0),
    utils.multiplyMatrices(utils.MakeTranslateMatrix(-1.5,0.0,0.0),
        utils.multiplyMatrices(utils.MakeRotateYMatrix(-p1_rot), utils.MakeTranslateMatrix(1.5,0.0,0.0)))));

    paletteR.set_pos(utils.multiplyMatrices(utils.MakeWorld(4.2, 2.0, 16.5, 0.0, 0.0, 0.0, 1.0),
    utils.multiplyMatrices(utils.MakeTranslateMatrix(1.5,0.0,0.0),
        utils.multiplyMatrices(utils.MakeRotateYMatrix(p2_rot), utils.MakeTranslateMatrix(-1.5,0.0,0.0)))));
}

    lastUpdateTime = currentTime;
    }


    function drawScene() {
        animate();

        gl.clearColor(0.85, 0.85, 0.85, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Camera setting
        var viewMatrix = utils.MakeView(cx, cy, cz, -40.0, 0.0);

        {//Ball rendering
        var worldViewMatrix = utils.multiplyMatrices(viewMatrix, ball.worldM);
        var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);

        var lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(ball.worldM));
        var directionalLightTransformed = utils.normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLight));
        gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

        gl.uniform3fv(materialDiffColorHandle, ball.col);
        gl.uniform1f(alphaLocation, 1.0);

        gl.uniform3fv(lightColorHandle,  directionalLightColor);
        gl.uniform3fv(lightDirectionHandle,  directionalLightTransformed);

        gl.bindVertexArray(b_vao);
        gl.drawElements(gl.TRIANGLES, (ball.ind).length, gl.UNSIGNED_SHORT, 0 );}

        {//Table rendering
        worldViewMatrix = utils.multiplyMatrices(viewMatrix, table.worldM);
        projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);
        lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(table.worldM));
        directionalLightTransformed = utils.normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLight));
        gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

        gl.uniform3fv(materialDiffColorHandle, table.col);
        gl.uniform1f(alphaLocation, 1.0);

        gl.uniform3fv(lightColorHandle,  directionalLightColor);
        gl.uniform3fv(lightDirectionHandle,  directionalLightTransformed);

        gl.bindVertexArray(t_vao);

        gl.drawElements(gl.TRIANGLES, (table.ind).length, gl.UNSIGNED_SHORT, 0 );
        }

        {//Palette rendering
        for(i = 0; i < 2; i++) {
            p = (i==0)?paletteL:paletteR;
            worldViewMatrix = utils.multiplyMatrices(viewMatrix, p.worldM);
            projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);
            lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(p.worldM));
            directionalLightTransformed = utils.normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLight));
            gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

            gl.uniform3fv(materialDiffColorHandle, p.col);
            gl.uniform1f(alphaLocation, 1.0);

            gl.uniform3fv(lightColorHandle,  directionalLightColor);
            gl.uniform3fv(lightDirectionHandle,  directionalLightTransformed);

            gl.bindVertexArray(p_vao);

            gl.drawElements(gl.TRIANGLES, (paletteR.ind).length, gl.UNSIGNED_SHORT, 0 );
        }
        }

        {//Wall LR rendering
        for(i = 0; i < 2; i++) {
            w = (i==0)?wallL:wallR;
            worldViewMatrix = utils.multiplyMatrices(viewMatrix, w.worldM);

            projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);
            lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(w.worldM));
            directionalLightTransformed = utils.normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLight));
            gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

            gl.uniform3fv(materialDiffColorHandle, w.col);
            gl.uniform1f(alphaLocation, 1.0);

            gl.uniform3fv(lightColorHandle,  directionalLightColor);
            gl.uniform3fv(lightDirectionHandle,  directionalLightTransformed);

            gl.bindVertexArray(wLR_vao);

            gl.drawElements(gl.TRIANGLES, (w.ind).length, gl.UNSIGNED_SHORT, 0 );
        }}

        {//Wall UD rendering
        for(i = 0; i < 2; i++) {
            w = (i==0)?wallU:wallD;
            worldViewMatrix = utils.multiplyMatrices(viewMatrix, w.worldM);

            projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);
            lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(w.worldM));
            directionalLightTransformed = utils.normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLight));
            gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

            gl.uniform3fv(materialDiffColorHandle, w.col);
            if (i==0){
                gl.uniform1f(alphaLocation, 1.0);
            } else {
                gl.uniform1f(alphaLocation, 0.1);
            }

            gl.uniform3fv(lightColorHandle,  directionalLightColor);
            gl.uniform3fv(lightDirectionHandle,  directionalLightTransformed);

            gl.bindVertexArray(wUD_vao);

            gl.drawElements(gl.TRIANGLES, (w.ind).length, gl.UNSIGNED_SHORT, 0 );
        }}

        window.requestAnimationFrame(drawScene);
        }
}


{//Palette key press
var p1UP = false;
var p2UP = false;

function paletteUPMovement(e)
{
  if (e.keyCode == 81) //q
  {
      p1UP = true;
  }
  if (e.keyCode == 80) //p
  {
        p2UP = true;
  }
}

function paletteDOWNMovement(e)
{
  if (e.keyCode == 81) //q
  {

      p1UP = false;
  }
  if (e.keyCode == 80) //p
  {
      p2UP = false;
  }
}}

{//Camera key press
function moveCamera(e){
  if(e.keyCode == 38) //arrow up
  {
    camy = true;
  }
  if(e.keyCode == 40) //arrow down
  {
    camy = false
  }
  if(e.keyCode == 39) //arrow left
  {
    camx = true;
  }
  if(e.keyCode == 37) //arrow right
  {
    camx = false;
  }
}}

//Objects class
class Item {
    constructor([vertices,normals,indices], color){
        this.vert = vertices;
        this.norm = normals;
        this.ind = indices;
        this.col = color;
    }

    set_pos(worldMatrix){
        this.worldM = worldMatrix;
    }
}

class dynBall extends Item{
  set_vel(vel){
    this.vel = vel;
  }

  gravity_update(deltaT){
    this.vel[2] += (9.81 * deltaT) / 1000;
  }
}


{//Functions calling
window.onload = main;
window.addEventListener("keydown", paletteUPMovement, false);
window.addEventListener("keyup", paletteDOWNMovement, false);
window.addEventListener("keydown", moveCamera, false);
}
