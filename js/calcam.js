THREE.CalibratedCamera = function ( fx, fy, x0, y0, s, width, height, near, far) {
    THREE.Camera.call( this );

    this.fx = fx;
    this.fy = fy;
    this.x0 = x0;
    this.y0 = y0;
    this.s = s;
    this.height = height;
    this.width = width;
    this.near = near;
    this.far = far;

    this.updateProjectionMatrix();

};

THREE.CalibratedCamera.prototype = new THREE.Camera();
THREE.CalibratedCamera.prototype.constructor = THREE.CalibratedCamera;

THREE.CalibratedCamera.prototype.updateProjectionMatrix = function () {
    var ortho_mat;
    this.projectionMatrix.makeOrthographic(
        -this.width/2.0,
         this.width/2.0,
         this.height/2.0,
        -this.height/2.0,
         this.near,
         this.far);

    var X = this.near + this.far;
    var Y = this.near * this.far;
    var intrinsicCameraMatrix = new THREE.Matrix4();
    intrinsicCameraMatrix.set(
            this.fx,  this.s, -this.x0,  0,
             0, this.fy, -this.y0,  0,
             0,  0,   X,  Y,
             0,  0,  -1,  0);
    this.projectionMatrix.multiplySelf(intrinsicCameraMatrix);
};

