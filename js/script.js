{//Global variables
var canvas;
var gl = null;
var program = null;
var baseDir;

//Arrays needed for objects instantiation
var object_matrix = new Array();
var vao = new Array();
var positionBuffer = new Array();
var normalBuffer = new Array();
var indexBuffer = new Array();
var uvBuffer = new Array();

//Textures handling
var textures = [];
var texturesEnabled = true;
var images = [];
var pageReady = false;

//Time for animation
var lastUpdateTime, currentTime;

//Matrix for rendering
var matrixLocation;
var perspectiveMatrix, projectionMatrix, viewMatrix;

//Light variables
var directionalLight;
var lightColorHandle;
var lightDirMatrixPositionHandle;
var lightDirectionHandle;
var materialDiffColorHandle;

//animation variables
var deltaRot = 0.0;
var deltax_ball = 0.0;
var deltay_ball = 0.0;
var deltaz_ball = 0.0;
var reloaderSpeed = 0.0;
//Camera variables
var cx = 0.0;
var cy = 10.0;
var cz = 25.0;
var elevation = -25.0;
var angle = 0.0;
var lookRadius = 30.0;

//Control Panel variables
var recentered = true;
var ballCol = [0.5,0.5,0.5];
var cylCol1 = [1.0,0.0,0.0];
var cylCol2 = [1.0,0.0,0.0];
var cylCol3 = [1.0,0.0,0.0];

var  k_dissip  = 0.8;
var nFrame = 0;

var coll = true;
}

{//Shader
var vs = `#version 300 es

in vec3 inPosition;
in vec3 inNormal;
in vec2 a_uv;
out vec4 finalColor;
out vec2 uvFS;

uniform vec3 mDiffColor;
uniform mat4 nMatrix;
uniform mat4 matrix;
uniform vec3 lightColor;
uniform vec3 lightDirection;
uniform vec3 specularColor;
uniform float SpecShine;

void main() {
  uvFS = a_uv;
  //diffuse
  vec3 diffuse = mDiffColor * max(dot(normalize(inNormal), lightDirection), 0.0);
  // specular
<<<<<<< HEAD
  //in camera space eyePos = [0,0,0] so eyeDir = normalize(-in_pos)
	vec3 eyeDir = normalize( - in_pos);
=======
  //in camera space eyePos = [0,0,0] so eyeDir = normalize(-inPosition)
	vec3 eyeDir = normalize( - inPosition);
>>>>>>> 052b62faab7952c7339e6e63d87bfd370dffd8d6
	vec3 halfVec = normalize(eyeDir + lightDirection);
	vec3 specular = specularColor * pow(max(dot(halfVec, inNormal),0.0),SpecShine);
  finalColor = vec4(clamp((diffuse+specular) * lightColor, 0.0, 1.0),1.0);
  gl_Position = matrix * vec4(inPosition, 1.0);
}`;

var fs = `#version 300 es

precision mediump float;

in vec4 finalColor;
in vec2 uvFS;
out vec4 outColor;

uniform float alpha;
uniform sampler2D u_texture;

void main() {
  vec4 color = vec4(finalColor.rgb,alpha);
  outColor = texture(u_texture, uvFS) * color;
}`;
}

async function main(){

    document.getElementById("Lost").style.visibility = "hidden";
    document.getElementById("c").style.visibility = "hidden";
    document.getElementById("panel").style.visibility = "hidden";
    document.getElementById("legend").style.visibility = "hidden";
    document.getElementById("FPSpanel").style.visibility = "hidden";

    var bumpObjStr =await utils.get_objstr("./models/bumper.obj");
    var bumpModel = new OBJ.Mesh(bumpObjStr);

    {//Lights
    var dirLightAlpha = -utils.degToRad(-90);
    var dirLightBeta  = -utils.degToRad(-0);

    directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha),
              Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
              ];
    directionalLightColor = [1.0, 1.0, 1.0];}

    {//Object construction
    var objects = new Array();
    var ball = new dynBall("ball", draw_ball(), ballCol);
    var cylinder1 = new Item("cyl1", [draw_bumper(bumpModel.vertices), bumpModel.vertexNormals, bumpModel.indices, bumpModel.textures], [1.0,0.0,0.0]);
    var cylinder2 = new Item("cyl2", [draw_bumper(bumpModel.vertices), bumpModel.vertexNormals, bumpModel.indices, bumpModel.textures], [1.0,0.0,0.0]);
    var cylinder3 = new Item("cyl3", [draw_bumper(bumpModel.vertices), bumpModel.vertexNormals, bumpModel.indices, bumpModel.textures], [1.0,0.0,0.0]);
    var table = new Item("table", draw_par(15.0, 0.5, 20.0), [0.0,1.0,0.2]);
    var paletteL = new dynPalette("paletteL", draw_par(3.0, 0.5, 1.0), [0.2, 0.2, 1.0]);
    var paletteR = new dynPalette("paletteR", draw_par(3.0, 0.5, 1.0), [0.2, 0.2, 1.0]);
    var wallL = new Item("wallL", draw_par(1.0 ,1.0 ,20.0), [0.0,1.0,0.2]);
    var wallR = new Item("wallR", draw_par(1.0 ,1.0 ,20.0), [0.0,1.0,0.2]);
    var wallU = new Item("wallU", draw_par(13.0 ,5.0, 0.5), [0.0,1.0,0.2]);
    var wallS = new Item("wallS", draw_par(13.0 ,5.0, 0.5), [0.0,1.0,0.2]);
    var wallD = new Item("wallD", draw_par(13.0 ,1.0 ,0.5), [0.0,1.0,0.2]);
    var palWallR = new Item("palWallR", draw_par(4.0,0.5,0.5), [0.2, 0.2, 1.0]);
    var palWallL = new Item("palWallL", draw_par(4.0,0.5,0.5), [0.2, 0.2, 1.0]);
    var reloader = new Item("reloader", draw_par(3.0,0.5,0.5),[1.0, 0.2, 0.0]);

    objects.push(ball, cylinder1, cylinder2, cylinder3, table, paletteL, paletteR, wallL, wallR, wallU, wallS, wallD, palWallR, palWallL,reloader);
  }

    {//Init object position and rotation
    // Sphere
    ball.set_pos(utils.MakeWorld(7.0, 1.5, 0.0, 0.0, 0.0, 0.0, 1.0));
    ball.set_vel([0.0, 0.0, 0.0]);
    //Cylinders
    cylinder1.set_pos(utils.MakeWorld(5.0, 1.5, 0.0, 0.0, 0.0, 0.0, 1.0));
    cylinder2.set_pos(utils.MakeWorld(0.0, 1.5, -5.0, 0.0, 0.0, 0.0, 1.0));
    cylinder3.set_pos(utils.MakeWorld(-5.0, 1.5, 0.0, 0.0, 0.0, 0.0, 1.0));
    // Table
    table.set_pos(utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0));
    //Palettes
    paletteL.set_pos(utils.MakeWorld(-4.2, 1.2,15.0, 0.0, -45.0, 0.0, 1.0));
    paletteR.set_pos(utils.MakeWorld(4.2, 1.2,15.0, 0.0, -45.0, 0.0, 1.0));
    paletteL.set_maxminangle(-45, 30);
    paletteR.set_maxminangle(-45, 30);
    paletteL.set_angle(paletteL.max_angle);
    paletteR.set_angle(paletteR.max_angle);
    //wall
    wallL.set_pos(utils.MakeWorld(-14.0, 1.5, 0.0, 0.0, 0.0, 0.0, 1.0));
    wallR.set_pos(utils.MakeWorld(14.0, 1.5, 0.0, 0.0, 0.0, 0.0, 1.0));
    wallU.set_pos(utils.MakeWorld(0.0, 4.5, -19.5, 0.0, 0.0, 0.0, 1.0));
    wallS.set_pos(utils.MakeWorld(0.0, 4.5, -19.5, 0.0, 0.0, 0.0, 1.0));
    wallD.set_pos(utils.MakeWorld(0.0, 1.5, 19.5, 0.0, 0.0, 0.0, 1.0));
    //Palettes Walls
    palWallL.set_pos(utils.MakeWorld(-9.5, 1.2, 10.7, 0.0, 45.0, 0.0, 1.0));
    palWallR.set_pos(utils.MakeWorld(9.5, 1.2, 10.7, 0.0, -45.0, 0.0, 1.0));
    //reloader
    reloader.set_pos(utils.MakeWorld(12.5, 1.2, -18.0, 0.0, -45.0, 0.0, 1.0));
  }

    //For animation
    lastUpdateTime = (new Date).getTime();

    {//Canvas
    canvas = document.getElementById("c");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    canvas.addEventListener("mousewheel", doMouseWheel, false);
    canvas.addEventListener("dblclick", resetCam, false);
    //utils.resizeCanvasToDisplaySize(gl.canvas);
    canvas.width = 1240;
    canvas.height = 700;
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
    var uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
    matrixLocation = gl.getUniformLocation(program, "matrix");
    materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
    lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
    lightColorHandle = gl.getUniformLocation(program, 'lightColor');
    perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
    var textLocation = gl.getUniformLocation(program, "u_texture");
    var normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');
    var specularColorHandle = gl.getUniformLocation(program,'specularColor');
    var specShineHandle = gl.getUniformLocation(program,'SpecShine');
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

      uvBuffer[i] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer[i]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objects[i].uv), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(uvAttributeLocation);
      gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    }}

    {//Textures
    var whiteColor = new Float32Array([1, 1, 1]);
    var whiteTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, whiteTexture);
    var whitePixel = new Uint8Array([255, 255, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, whitePixel);

    for(i = 0; i< objects.length; i++){
      var image = new Image();
      image.src = "./textures/" + objects[i].name + ".png";
      images.push(image);
    }

    setTimeout(function(){
      for(i = 0; i<objects.length; i++){
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        textures.push(texture);
        pageReady = true;
        pageLoader();
      }
    }, 1000);
    }

    drawScene();

    //Function to handle animation
    function animate(){
    nFrame++;
    currentTime = (new Date).getTime();
    let deltaT = currentTime - lastUpdateTime;

    {//Ball Animation
    //Change ball color from slider
    ball.col = ballCol;
    //Gravity update and Collision Detection
    if(lastUpdateTime && !recentered){
      ball.gravity_update(deltaT);
      //Palettes and wall Palettes collisions (suspende detection for 1,5sec after first detection)
      if(coll){collision.collisionDetection(ball,[paletteL, paletteR, palWallL, palWallR]);}
      setTimeout(function(){coll=true;}, 1500);
      //Cylinder collisions with color change
      collision.collisionCylinders(ball,[cylinder1,cylinder2,cylinder3]);
      cylinder1.col = cylCol1;
      cylinder2.col = cylCol2;
      cylinder3.col = cylCol3;
      if(nFrame%60 == 0){
        cylCol1 = [1.0,0.0,0.0];
        cylCol2 = [1.0,0.0,0.0];
        cylCol3 = [1.0,0.0,0.0];
      }
      //Wall collisions
      collision.checkBoundaries(ball, wallL, wallR, wallU, wallD);



      deltax_ball = (ball.vel[0]*deltaT) / 1000.0;
      deltay_ball = (ball.vel[1]*deltaT) / 1000.0;
      deltaz_ball = (ball.vel[2]*deltaT) / 1000.0;
      ball.set_pos(utils.MakeWorld(ball.pos()[0]+deltax_ball, ball.pos()[1]+deltay_ball, ball.pos()[2]+deltaz_ball, 0.0, 0.0, 0.0, 1.0));
      }

    //Reset Ball position when R is pressed
    if(lastUpdateTime && recentered){
      ball.set_pos(utils.MakeWorld(9.5,1.5,-14.7,0.0,0.0,0.0,1.0));
      ball.set_vel([-reloaderSpeed,0.0,reloaderSpeed]);
    }
  }

    {//Palette Animation
    deltaRot = (700 * deltaT) / 1000.0;
    if(lastUpdateTime){
        paletteL.set_angle((p1UP)? (Math.min(paletteL.min_angle, paletteL.angle+deltaRot)):(Math.max(paletteL.max_angle, paletteL.angle-deltaRot)));
        paletteR.set_angle((p2UP)? (Math.min(paletteR.min_angle, paletteR.angle+deltaRot)):(Math.max(paletteR.max_angle, paletteR.angle-deltaRot)));
    }

    paletteL.set_pos(utils.multiplyMatrices(utils.MakeWorld(-4.2, 1.2,15.0, 0.0, 0.0, 0.0, 1.0),
    utils.multiplyMatrices(utils.MakeTranslateMatrix(-1.5,0.0,0.0),
        utils.multiplyMatrices(utils.MakeRotateYMatrix(-paletteL.angle), utils.MakeTranslateMatrix(1.5,0.0,0.0)))));

    paletteR.set_pos(utils.multiplyMatrices(utils.MakeWorld(4.2, 1.2,15.0, 0.0, 0.0, 0.0, 1.0),
    utils.multiplyMatrices(utils.MakeTranslateMatrix(1.5,0.0,0.0),
        utils.multiplyMatrices(utils.MakeRotateYMatrix(paletteR.angle), utils.MakeTranslateMatrix(-1.5,0.0,0.0)))));
    }

    {//Reloader animation
    var deltaPos_In = (0.8 * deltaT) / 1000.0;
    if(rUP){
      deltaPos_In = (reloader.pos()[0] + deltaPos_In > 14.0)? 0.0:deltaPos_In;
      reloader.set_pos(utils.multiplyMatrices(reloader.worldM, utils.MakeTranslateMatrix(deltaPos_In,0.0,0.0)));
      reloaderSpeed += 0.4;
    }
    if(!rUP){
      reloader.set_pos(utils.MakeWorld(12.5, 1.2, -18.0, 0.0, -45.0, 0.0, 1.0));
      reloaderSpeed = 0.0;
    }}

    lastUpdateTime = currentTime;

    }

    function drawScene() {
        animate();
        gl.clearColor(0.85, 0.85, 0.85, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        {// Camera setting
        cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    		cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    		cy = lookRadius * Math.sin(utils.degToRad(-elevation));
        var viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
        var lightDirMatrix = utils.invertMatrix(utils.transposeMatrix(viewMatrix));
        var lightDirectionTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(lightDirMatrix),directionalLight);}

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
          //gl.uniform3fv(materialDiffColorHandle, objects[i].col);
          gl.uniform1f(alphaLocation, 1.0);
          gl.uniformMatrix4fv(lightDirMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(lightDirMatrix));

          gl.uniform3fv(specularColorHandle,  [1.0,1.0,1.0]);
          gl.uniform1f(specShineHandle, 8.0);

          //Set transparency for the Down WALL
          if(objects[i].name == "wallD" || objects[i].name == "wallS" ){ gl.uniform1f(alphaLocation, 0.1); }

          gl.uniform3fv(lightColorHandle,  directionalLightColor);
          gl.uniform3fv(lightDirectionHandle,  directionalLight);

          gl.bindVertexArray(vao[i]);

          if(texturesEnabled){
            gl.uniform3fv(materialDiffColorHandle, whiteColor);
            gl.uniform1i(textLocation, i);
            gl.bindTexture(gl.TEXTURE_2D, textures[i]);
            document.getElementById("favcolor").disabled = true;
          }
          else{
            gl.uniform3fv(materialDiffColorHandle, objects[i].col);
            gl.bindTexture(gl.TEXTURE_2D, whiteTexture);
            document.getElementById("favcolor").disabled = false;
          }

          gl.drawElements(gl.TRIANGLES, (objects[i].ind).length, gl.UNSIGNED_SHORT, 0 );
        }}

        window.requestAnimationFrame(drawScene);
        }
}

{//Reloader key press
var rUP = false;

function reloaderUPMovement(e)
{
  if(e.keyCode == 32) //space bar
  {
    document.getElementById("Lost").style.visibility = "hidden";
    rUP = true;
  }
}
function reloaderDOWNMovement(e)
{
  if(e.keyCode == 32) //space bar
  {

    rUP = false;
    recentered = false;
  }
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
  var mouseState = false;
  var lastMouseX = -100, lastMouseY = -100;
  function doMouseDown(e) {
    if(e.button == 0){
      lastMouseX = e.pageX;
    	lastMouseY = e.pageY;
    	mouseState = true;
    }
  }
  function doMouseUp(e) {
    if(e.button == 0){
  	lastMouseX = -100;
  	lastMouseY = -100;
  	mouseState = false;
    }
  }
  function doMouseMove(e) {
  	if(mouseState) {
  		var dx = e.pageX - lastMouseX;
  		var dy = lastMouseY - e.pageY;
  		lastMouseX = e.pageX;
  		lastMouseY = e.pageY;

  		if((dx != 0) || (dy != 0)) {
  			angle = angle + 0.5 * dx;
  			elevation = elevation + 0.5 * dy;
  		}
  	}
  }
  function doMouseWheel(e) {
  	var nLookRadius = lookRadius + e.wheelDelta/1000.0;
  	if((nLookRadius > 2.0) && (nLookRadius < 20.0)) {
  		lookRadius = nLookRadius;
  	}
  }
  function resetCam(e){
    cx = 0.0;
    cy = 10.0;
    cz = 25.0;
    elevation = -25.0;
    angle = 0.0;
    lookRadius = 30.0;
  }
}

{//Ball recenter key press
function resetBall(e){
  if(e.keyCode == 82) //r
  {
    recentered = true;
  }
}}

//Objects class
class Item {
    constructor(name, [vertices,normals,indices,uv], color){
        this.name = name;
        this.vert = vertices;
        this.norm = normals;
        this.ind = indices;
        this.col = color;
        this.uv = uv;
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

  get_vel(deltaR, point){
    var rot_center = (this.name == "paletteL")?([-5.7, 1.2, 15.0]):([5.7, 1.2, 15.0]);
    point = Math.sqrt((rot_center[0]-point[0])*(rot_center[0]-point[0]) + (rot_center[2]-point[2])*(rot_center[2]-point[2]));
    return (this.angle == this.max_angle || this.angle == this.min_angle)?
            ([0.0,0.0,0.0]):([(deltaR*point)*Math.cos(utils.degToRad(90-this.angle)), 0.0, (deltaR*point)*Math.sin(utils.degToRad(90-this.angle))]);

  }

}


{//Functions calling
window.onload = main;
window.addEventListener("keydown", paletteUPMovement, false);
window.addEventListener("keyup", paletteDOWNMovement, false);
window.addEventListener("keydown", resetBall, false);
window.addEventListener("keydown", reloaderUPMovement, false);
window.addEventListener("keyup", reloaderDOWNMovement, false);
}
