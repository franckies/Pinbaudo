//3D cube vertex coordinates and indices

var vertices = [					// Vertex #:
	 	//Top
	-1.0, 1.0, -1.0,
	-1.0, 1.0, 1.0,
	1.0, 1.0, 1.0,
	1.0, 1.0, -1.0,

  //Left
	-1.0, 1.0, 1.0,
	-1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,
	-1.0, 1.0, -1.0,

  //Right
	1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,
	1.0, -1.0, -1.0,
	1.0, 1.0, -1.0,

  //Front
	1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,
	-1.0, -1.0, 1.0,
	-1.0, 1.0, 1.0,

  //Back
	1.0, 1.0, -1.0,
	1.0, -1.0, -1.0,
	-1.0, -1.0, -1.0,
	-1.0, 1.0, -1.0,
	// Bottom
	-1.0, -1.0, -1.0,
	-1.0, -1.0, 1.0,
	1.0, -1.0, 1.0,
	1.0, -1.0, -1.0
];

var indices = [ 	// Face #:
	  // Top
    0, 1, 2,
	0, 2, 3,

	// Left
	5, 4, 6,
	6, 4, 7,

	// Right
	8, 9, 10,
	8, 10, 11,

	// Front
	13, 12, 14,
	15, 14, 12,

	// Back
	16, 17, 18,
	16, 18, 19,

	// Bottom
	21, 20, 22,
	22, 20, 23
];

var normals = [					// Color #:
	 0.0, 1.0, 0.0,  //  0
	 0.0, 1.0, 0.0,  //  1
	 0.0, 1.0, 0.0,  //  2
	 0.0, 1.0, 0.0,  //  3
	 -1.0, 0.0, 0.0,  //  4
	 -1.0, 0.0, 0.0,  //  5
	 -1.0, 0.0, 0.0,  //  6
	 -1.0, 0.0, 0.0,  //  7
	 1.0, 0.0, 0.0,  //  8
	 1.0, 0.0, 0.0,  //  9
	 1.0, 0.0, 0.0,  // 10
	 1.0, 0.0, 0.0,  // 11
	 0.0, 0.0, 1.0,  // 12
	 0.0, 0.0, 1.0,  // 13
	 0.0, 0.0, 1.0,  // 14
	 0.0, 0.0, 1.0,  // 15
	 0.0,  0.0, -1.0,  // 16
	 0.0,  0.0, -1.0,  // 17
	 0.0,  0.0, -1.0,  // 18
	 0.0,  0.0, -1.0,  // 19
	 0.0, -1.0, 0.0,  // 20
	 0.0, -1.0, 0.0,  // 21
	 0.0, -1.0, 0.0,  // 22
	 0.0, -1.0, 0.0   // 23
];

var uv = [
	//Up
  28.0/632.0, 212.0/640.0,
  28.0/632.0, 582.0/640.0,
  132.0/632.0, 582.0/640.0,
  132.0/632.0, 212.0/640.0,
  // Left
  28.0/632.0, 212.0/640.0,
  132.0/632.0, 212.0/640.0,
  132.0/632.0, 582.0/640.0,
  28.0/632.0, 582.0/640.0,

  // Right
  132.0/632.0, 582.0/640.0,
  28.0/632.0, 582.0/640.0,
  28.0/632.0, 212.0/640.0,
  132.0/632.0, 212.0/640.0,

  // Front
  132.0/632.0, 582.0/640.0,
  132.0/632.0, 212.0/640.0,
  28.0/632.0, 212.0/640.0,
  28.0/632.0, 582.0/640.0,

  // Back
  28.0/632.0, 212.0/640.0,
  28.0/632.0, 582.0/640.0,
  132.0/632.0, 582.0/640.0,
  132.0/632.0, 212.0/640.0,

  // Bottom
  132.0/632.0, 582.0/640.0,
  132.0/632.0, 212.0/640.0,
  28.0/632.0, 212.0/640.0,
  28.0/632.0, 582.0/640.0
];

function draw_par(x,y,z) {
	var v = [];
	for (let i = 0; i < 24; i++) {
		v[i * 3 + 0] = vertices[i * 3 + 0] * x;
		v[i * 3 + 1] = vertices[i * 3 + 1] * y;
		v[i * 3 + 2] = vertices[i * 3 + 2] * z;
	}
	return [v, normals, indices, uv];
}
