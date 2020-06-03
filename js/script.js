{//Global variables
var canvas;
var gl = null;
var program = null;

//Arrays needed for objects instantiation
var object_matrix = new Array();
var vao = new Array();
var positionBuffer = new Array();
var normalBuffer = new Array();
var indexBuffer = new Array();

//Time for animation
var lastUpdateTime, currentTime;

//Matrix for rendering
var matrixLocation;
var perspectiveMatrix, projectionMatrix, viewMatrix;

//Light variables
var directionalLight;
var lightColorHandle;
var lightDirectionHandle;
var materialDiffColorHandle;

//animation variables
var deltaRot = 0.0;
var deltax_ball = 0.0;
var deltay_ball = 0.0;
var deltaz_ball = 0.0;

//Camera variables
var cx = 0.0;
var cy = 10.0;
var cz = 25.0;
var camx = null;
var camy = null;

var nFrame = 0;
}

{//Shader
var vs = `#version 300 es

in vec3 inPosition;
in vec3 inNormal;
out vec3 fsNormal;

uniform mat4 nMatrix;
uniform mat4 matrix;

void main() {
  fsNormal = mat3(nMatrix) * inNormal;
  //fsNormal = inNormal;
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
  vec3 lambertColor = mDiffColor * lightColor * dot(-lightDirection,nNormal);
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
    var objects = new Array();
    var ball = new dynBall("ball", draw_ball(), [0.2, 0.2, 1.0]);
    var table = new Item("table", draw_par(15.0, 0.5, 20.0), [1.0, 0.65, 0.0]);
    var paletteL = new dynPalette("paletteL", draw_par(3.0, 2, 1.0), [1.0, 1.0, 1.0]);
    var paletteR = new dynPalette("paletteR", draw_par(3.0, 2, 1.0), [1.0, 1.0, 1.0]);
    var wallL = new Item("wallL", draw_par(1.0 ,1.0 ,20.0), [1.0, 0.65, 0.0]);
    var wallR = new Item("wallR", draw_par(1.0 ,1.0 ,20.0), [1.0, 0.65, 0.0]);
    var wallU = new Item("wallU", draw_par(13.0 ,1.0, 0.5), [1.0, 0.65, 0.0]);
    var wallD = new Item("wallD", draw_par(13.0 ,1.0 ,0.5), [1.0, 0.65, 0.0]);
    objects.push(ball, table, paletteL, paletteR, wallL, wallR, wallU, wallD);
  }

    {//Init object position and rotation
    // Sphere
    ball.set_pos(utils.MakeWorld(-5, 1.5, 0.0, 0.0, 0.0, 0.0, 1.0));
    ball.set_vel([0.0, 0.0, 0.0]);
    // Table
    table.set_pos(utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0));
    //Palettes
    paletteL.set_pos(utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0));
    paletteR.set_pos(utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0));
    paletteL.set_maxminangle(-45, 30);
    paletteR.set_maxminangle(-45,30);
    paletteL.set_angle(paletteL.max_angle);
    paletteR.set_angle(paletteR.max_angle);
    //wall
    wallL.set_pos(utils.MakeWorld(-14.0, 1.5, 0.0, 0.0, 0.0, 0.0, 1.0));
    wallR.set_pos(utils.MakeWorld(14.0, 1.5, 0.0, 0.0, 0.0, 0.0, 1.0));
    wallU.set_pos(utils.MakeWorld(0.0, 1.5, -19.5, 0.0, 0.0, 0.0, 1.0));
    wallD.set_pos(utils.MakeWorld(0.0, 1.5, 19.5, 0.0, 0.0, 0.0, 1.0));}

    //For animation

    lastUpdateTime = (new Date).getTime();

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
    gl.enable(gl.DEPTH_TEST);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);}

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
    perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
    var normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');
    alphaLocation = gl.getUniformLocation(program, 'alpha');}

    {//Passing objects to shader
    for(i = 0; i < objects.length; i++)
    {
      vao[i] = gl.createVertexArray();
      gl.bindVertexArray(vao[i]);
      positionBuffer[i] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer[i]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objects[i].vert), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

      normalBuffer[i] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer[i]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objects[i].norm), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(normalAttributeLocation);
      gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

      indexBuffer[i] = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer[i]);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objects[i].ind), gl.STATIC_DRAW);
      // console.log(objects[i]);
    }}

    drawScene();

    //Function to handle animation
    function animate(){
    nFrame++;
    currentTime = (new Date).getTime();
    let deltaT = currentTime - lastUpdateTime;

    //Collisions
    // if(lastUpdateTime){
    //   utils.collisionDetection(ball,[paletteL, paletteR]);
    //   utils.checkBoundaries(ball, wallL, wallR, wallU, wallD);
    // }

    {//Camera movement
    if (lastUpdateTime){
        if (camx !== null) {
            if (camx) {
                cx += 15 * deltaT / 1000.0;
            } else {
                cx -= 15 * deltaT / 1000.0
            }
        }

        if (camy !== null) {
            if (camy) {
                cy += 10.0 * deltaT / 1000.0;
            } else if (!camy) {
                cy -= 10.0 * deltaT / 1000.0;
            }
        }

        camx = null;
        camy = null;
    }}

    {//Ball Animation
    //Gravity update
    if(lastUpdateTime){
      if(coll){
          ball.gravity_update(deltaT);
          utils.collisionDetection(ball,[paletteL, paletteR]);
          utils.checkBoundaries(ball, wallL, wallR, wallU, wallD);
      }
      deltax_ball = (ball.vel[0]*deltaT) / 1000.0;
      deltay_ball = (ball.vel[1]*deltaT) / 1000.0;
      deltaz_ball = (ball.vel[2]*deltaT) / 1000.0;
    }
    ball.set_pos(utils.MakeWorld(ball.pos()[0]+deltax_ball, ball.pos()[1]+deltay_ball, ball.pos()[2]+deltaz_ball, 0.0, 0.0, 0.0, 1.0));}

    {//Palette Animation
    deltaRot = (350 * deltaT) / 1000.0;
    if(lastUpdateTime){
        paletteL.set_angle((p1UP)? (Math.min(paletteL.min_angle, paletteL.angle+deltaRot)):(Math.max(paletteL.max_angle, paletteL.angle-deltaRot)));
        paletteR.set_angle((p2UP)? (Math.min(paletteR.min_angle, paletteR.angle+deltaRot)):(Math.max(paletteR.max_angle, paletteR.angle-deltaRot)));
    }

    paletteL.set_pos(utils.multiplyMatrices(utils.MakeWorld(-4.2, 1.2 , 16.5, 0.0, 0.0, 0.0, 1.0),
    utils.multiplyMatrices(utils.MakeTranslateMatrix(-1.5,0.0,0.0),
        utils.multiplyMatrices(utils.MakeRotateYMatrix(-paletteL.angle), utils.MakeTranslateMatrix(1.5,0.0,0.0)))));

    paletteR.set_pos(utils.multiplyMatrices(utils.MakeWorld(4.2, 1.2, 16.5, 0.0, 0.0, 0.0, 1.0),
    utils.multiplyMatrices(utils.MakeTranslateMatrix(1.5,0.0,0.0),
        utils.multiplyMatrices(utils.MakeRotateYMatrix(paletteR.angle), utils.MakeTranslateMatrix(-1.5,0.0,0.0)))));
    }

    lastUpdateTime = currentTime;
    }

    function drawScene() {
        animate();

        gl.clearColor(0.85, 0.85, 0.85, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Camera setting
        var viewMatrix = utils.MakeView(cx, cy, cz, -40.0, 0.0);

        {//Object rendering
        for(i = 0; i < objects.length; i++)
        {
          var worldViewMatrix = utils.multiplyMatrices(viewMatrix, objects[i].worldM);
          var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);

          // var lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(objects[i].worldM));
          // var directionalLightTransformed = utils.normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLight));

          gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
          //var normalMatrix = utils.transposeMatrix(utils.invertMatrix(utils.transposeMatrix(objects[i].worldM)));

          gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(objects[i].worldM));
          gl.uniform3fv(materialDiffColorHandle, objects[i].col);
          gl.uniform1f(alphaLocation, 1.0);
          //Set transparency for the Down WALL
          if(objects[i].name == "wallD"){ gl.uniform1f(alphaLocation, 0.1); }

          gl.uniform3fv(lightColorHandle,  directionalLightColor);
          gl.uniform3fv(lightDirectionHandle,  directionalLight);

          gl.bindVertexArray(vao[i]);
          gl.drawElements(gl.TRIANGLES, (objects[i].ind).length, gl.UNSIGNED_SHORT, 0 );
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
    constructor(name, [vertices,normals,indices], color){
        this.name = name;
        this.vert = vertices;
        this.norm = normals;
        this.ind = indices;
        this.col = color;
    }

    set_pos(worldMatrix){
        this.worldM = worldMatrix;
    }

    pos(){
      return [this.worldM[3], this.worldM[7], this.worldM[11]];
    }
}

class dynBall extends Item{
  set_vel(vel){
    this.vel = vel;
  }

  gravity_update(deltaT){
    this.vel[2] += (9.8 * deltaT) / 1000;
  }
}

class dynPalette extends Item{
  set_angle(angle){
    this.angle = angle;
  }

  set_maxminangle(maxangle,minangle){
    this.max_angle = maxangle;
    this.min_angle = minangle;
  }

  get_vel(deltaR){
    return (this.angle == this.max_angle || this.angle == this.min_angle)?
            ([0.0,0.0,0.0]):([(deltaR/6.0)*Math.cos(utils.degToRad(90-this.angle)), 0.0, (deltaR/6.0)*Math.sin(utils.degToRad(90-this.angle))]);
  }

}

var coll = true;
var vx_p= 0.0;
var vz_p = 0.0;
{//Functions calling
window.onload = main;
window.addEventListener("keydown", paletteUPMovement, false);
window.addEventListener("keyup", paletteDOWNMovement, false);
window.addEventListener("keydown", moveCamera, false);
}
