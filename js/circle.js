///// Creates vertices
	var vert3 = [[0.0, 1.0, 0.0]];
	var norm3 = [[0.0, 1.0, 0.0]];
	for(i = 0; i < 36; i++) {
		vert3[i+1] = [Math.sin(i*10.0/180.0*Math.PI), 1.0, Math.cos(i*10.0/180.0*Math.PI)];
		norm3[i+1] = [0.0, 1.0, 0.0];
	}
	////// Creates indices
	var ind3 = [];

	//////// Lower part
	for(i = 0; i < 36; i++) {
    ind3[j++] = 0;
    ind3[j++] = i + 1;
    ind3[j++] = (i + 1) % 36 + 1;
	}

  function draw_circle(x,y,z){
  	var v = [];
    vert4 = vert3.flat(1);
  	for (i=0; i<vert4.length; i++){
  		v[i*3 + 0] = vert4[i*3 + 0] * x;
  		v[i*3 + 1] = vert4[i*3 + 1] * y;
  		v[i*3 + 2] = vert4[i*3 + 2] * z;
  	}
  	return [v, norm3, ind3];
  }
