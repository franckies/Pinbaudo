var fontInfo = {
  maxX : 64,
  maxY: 40,
  glyphInfos: {
    'a': { x:  0, y:  32},
    'b': { x:  8, y:  32},
    'c': { x: 16, y:  32},
    'd': { x: 24, y:  32},
    'e': { x: 32, y:  32},
    'f': { x: 40, y:  32},
    'g': { x: 48, y:  32},
    'h': { x: 56, y:  32},
    'i': { x:  0, y:  24},
    'j': { x:  8, y:  24},
    'k': { x: 16, y:  24},
    'l': { x: 24, y:  24},
    'm': { x: 32, y:  24},
    'n': { x: 40, y:  24},
    'o': { x: 48, y:  24},
    'p': { x: 56, y:  24},
    'q': { x:  0, y: 16},
    'r': { x:  8, y: 16},
    's': { x: 16, y: 16},
    't': { x: 24, y: 16},
    'u': { x: 32, y: 16},
    'v': { x: 40, y: 16},
    'w': { x: 48, y: 16},
    'x': { x: 56, y: 16},
    'y': { x:  0, y: 8},
    'z': { x:  8, y: 8},
    '0': { x: 16, y: 8},
    '1': { x: 24, y: 8},
    '2': { x: 32, y: 8},
    '3': { x: 40, y: 8},
    '4': { x: 48, y: 8},
    '5': { x: 56, y: 8},
    '6': { x:  0, y: 0},
    '7': { x:  8, y: 0},
    '8': { x: 16, y: 0},
    '9': { x: 24, y: 0},
    '-': { x: 32, y: 0},
    '*': { x: 40, y: 0},
    '!': { x: 48, y: 0},
    '?': { x: 56, y: 0},
  },
};

//Function that given a texture dictionary and a string returns the uv mapping with the wanted character
function getUVfromString(fontInfo, s){
  var len = s.length;
  var textUvs = [];
  var maxX = fontInfo.maxX;
  var maxY = fontInfo.maxY;
  for(i = 0; i< len; i++){
    let letter = s[i];
    var u1 = fontInfo.glyphInfos[letter].x;
    var v1 = fontInfo.glyphInfos[letter].y;
    var u2 = u1+8;
    var v2 = v1+8;
    textUvs.push(u1/maxX, v1/maxY, u2/maxX, v1/maxY, u1/maxX, v2/maxY, u2/maxX, v2/maxY);
  }
  return textUvs;
}



//Init texture score
var zeros = getUVfromString(fontInfo, "00000000");
var uv2 = zeros;

var normals2 = [
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0
];
//Functions drawing squares
function draw_square(x){
    var new_vertices = [
        x*2, 0.0, 0.0,
        x*2+2.0, 0.0, 0.0,
        x*2, 2.0, 0.0,
        x*2+2.0, 2.0, 0.0
    ];
    var new_indices = [
        0+x*4, 1+x*4, 2+x*4,
        1+x*4, 2+x*4, 3+x*4
    ];
    return [new_vertices, new_indices, normals2, uv2];
}

function draw_squares(n){
    var v = [];
    var ind = [];
    var nor = [];
    for (i=0; i < n; i++){
        let tmp = draw_square(i);
        v = v.concat(tmp[0]);
        ind = ind.concat(tmp[1]);
        nor = nor.concat(tmp[2]);
    }
    return [v,nor,ind,uv2];
}
