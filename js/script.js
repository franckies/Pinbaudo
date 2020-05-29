function main(){
    var program = null;
    var ball_matrix = new Array();

    var dirLightAlpha = -utils.degToRad(60);
    var dirLightBeta  = -utils.degToRad(120);

    var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha),
              Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
              ];
    var directionalLightColor = [0.1, 1.0, 1.0];

    var [vertices, normals, indexes, color] = draw_ball();

    console.log(vertices, normals, indexes, color);


}

main();