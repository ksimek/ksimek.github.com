/**
 * @author ksimek  http://ksimek.github.com
 * Constructs a camera frustum from a calibrated camera.
 * based on THREE.PlaneGeometry by mr.doob / http://mrdoob.com/
 */


THREE.FrustumGeometry = function (near, far, camera) {
    var frustum_depth = far - near;
    THREE.CubeGeometry.call( this, camera.width, camera.height, frustum_depth );

    for(var i = 0; i < this.vertices.length; ++i)
    {
        this.vertices[i].z += frustum_depth/2 + near;
        var z = this.vertices[i].z;

        this.vertices[i].x *= z;
        this.vertices[i].y *= z;
    }

    camera.updateScreenToCameraMatrix();

    this.applyMatrix(camera.screenToCameraMatrix);
    this.applyMatrix(camera.matrix);

    this.computeCentroids();
};

THREE.FrustumGeometry.prototype = new THREE.CubeGeometry();
THREE.FrustumGeometry.prototype.constructor = THREE.FrustumGeometry;
