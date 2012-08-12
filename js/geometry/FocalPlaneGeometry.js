/**
 * @author ksimek  http://ksimek.github.com
 * Constructs a focal plane geometry from a calibrated camera.
 * based on THREE.PlaneGeometry by mr.doob / http://mrdoob.com/
 */


THREE.FocalPlaneGeometry = function (camera) {
    THREE.Geometry.call( this );

    var focal_length = camera.fx;

    this.vertices.push(new THREE.Vector3(-camera.width/2.0, -camera.height/2.0, focal_length));
    this.vertices.push(new THREE.Vector3( camera.width/2.0, -camera.height/2.0, focal_length));
    this.vertices.push(new THREE.Vector3( camera.width/2.0,  camera.height/2.0, focal_length));
    this.vertices.push(new THREE.Vector3(-camera.width/2.0,  camera.height/2.0, focal_length));


    var face = new THREE.Face4(0, 1, 2, 3);
    var normal = new THREE.Vector3(0.0, 0.0, 1.0);
    face.normal = normal;
    face.vertexNormals.push(normal.clone(), normal.clone(), normal.clone(), normal.clone());

    this.faces.push(face);
    this.faceVertexUvs[ 0 ].push([
            new THREE.UV(0, 0),
            new THREE.UV(0, 1),
            new THREE.UV(1, 1),
            new THREE.UV(0, 1)
    ]);

    for(var i = 0; i < this.vertices.length; ++i)
    {
        var z = this.vertices[i].z;

        this.vertices[i].x *= z;
        this.vertices[i].y *= z;
    }

    camera.updateScreenToCameraMatrix();

    this.applyMatrix(camera.screenToCameraMatrix);
    this.applyMatrix(camera.matrix);

    this.computeCentroids();
};

THREE.FocalPlaneGeometry.prototype = new THREE.Geometry();
THREE.FocalPlaneGeometry.prototype.constructor = THREE.FocalPlaneGeometry;
