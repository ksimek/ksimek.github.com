$(document).ready(function(){
    var $container;
// attach the render-supplied DOM element


    $container = $('#3d_container');
    
    var clock = new THREE.Clock();
    var revolve_t = 0;
    var REVOLVE_PERIOD = 10;
    var REVOLVE_RADIUS = 400;
    var x0, y0, s, fx, fy;
    var rot_y, tx, ty, tz;

    // set the scene size
    var parent_width = $('#3d_container').parent().width();
    var WIDTH = parent_width/2,
      HEIGHT = 2/3*WIDTH;

    // set some camera attributes
    var VIEW_ANGLE = 90;
    var default_focal = HEIGHT / 2 / Math.tan(VIEW_ANGLE/2 * Math.PI / 360);
    var FOCAL_MIN = default_focal * 0.75
    var FOCAL_MAX = default_focal * 3;
    var SKEW_MIN = 0.0;
    var SKEW_MAX = HEIGHT;
    var X0_MIN = -WIDTH/2;
    var X0_MAX =  WIDTH/2;
    var Y0_MIN = -HEIGHT/2;
    var Y0_MAX =  HEIGHT/2;

    var WORLD_RX_MIN = -Math.PI/6;
    var WORLD_RX_MAX =  Math.PI/6;
    var WORLD_RY_MIN = -Math.PI/6;
    var WORLD_RY_MAX =  Math.PI/6;
    var WORLD_RZ_MIN = -Math.PI/6;
    var WORLD_RZ_MAX =  Math.PI/6;

    var WORLD_X_MIN = -100;
    var WORLD_X_MAX =  100;
    var WORLD_Y_MIN = -100;
    var WORLD_Y_MAX =  100;
    var WORLD_Z_MIN =   50;
    var WORLD_Z_MAX =  500;
    
    var ASPECT = WIDTH / HEIGHT,
      NEAR = WORLD_Z_MIN,
      FAR = 1000;

    // get the DOM element to attach to
    // - assume we've got jQuery to hand

    // create a WebGL renderer, camera
    // and a scene
    var renderer = new THREE.WebGLRenderer();
    // start the renderer
    renderer.setSize(WIDTH*2, HEIGHT);
    renderer.autoClear = false;
    $container.prepend(renderer.domElement);

    var scene = new THREE.Scene();
    var camera_scene = new THREE.Scene();

//    var renderer = new THREE.CanvasRenderer();


    var default_camera =
      new THREE.CalibratedCamera(
        default_focal, default_focal,
        0, 0,
        0,
        WIDTH,
        HEIGHT,
        NEAR,
        FAR);
    default_camera.updateProjectionMatrix();
    default_camera.position.x = -30;
    default_camera.position.z = 300;
    default_camera.updateMatrix();

    // camera_t: world origin in camera coordinates
    var camera_t = new THREE.Vector3();
    get_camera_t(default_camera, camera_t);
    var camera_r = new THREE.Vector3();
    camera_r.copy(default_camera.rotation);

    var camera = default_camera.clone();

    // add the camera to the scene
    scene.add(camera);
    camera_scene.add(camera);


    
    // camera frustum
    var frustum_far = FOCAL_MAX;
    var frustum_material =
        new THREE.MeshBasicMaterial( { color: 0x666666, wireframe: true } );
//        var frustum = new THREE.Mesh(
//                camera.makeFrustumGeometry(0, frustum_far),
//                frustum_material
//                );
    var frustum = new THREE.Mesh(
            new THREE.FrustumGeometry(0, frustum_far, camera),
            frustum_material
            );
    camera_scene.add(frustum);

    var focal_plane_material = new THREE.MeshBasicMaterial({color: 0xEEEE00, transparent: true, opacity: 0.5});
    var focal_plane = new THREE.Mesh(
            new THREE.FocalPlaneGeometry(camera),
            focal_plane_material);
    focal_plane.doubleSided = true;

    camera_scene.add(focal_plane);

    var cameraCubeMaterial = new THREE.MeshBasicMaterial({color: 0x0000bb});
    var cameraCube = new THREE.Mesh(
          new THREE.CubeGeometry(
            75/2,
            75/2,
            37.5/2),
          cameraCubeMaterial);
    cameraCube.position = camera.position;
    cameraCube.rotation = camera.rotation;
    camera_scene.add(cameraCube);

    // set up the sphere vars
    var radius = 50,
        segments = 16,
        rings = 16;

    // create the sphere's material
    var sphereMaterial =
      new THREE.MeshLambertMaterial(
        {
          color: 0xCC0000
        });

    var sphere2Material =
      new THREE.MeshLambertMaterial(
        {
          color: 0x00CC00
        });

    var sphere = new THREE.Mesh(

      new THREE.SphereGeometry(
        radius,
        segments,
        rings),

      sphereMaterial);

    sphere.position.z += 0;
    sphere.position.x += 0;

    var sphere2 = new THREE.Mesh(

      new THREE.SphereGeometry(
        radius,
        segments,
        rings),

      sphere2Material);

    sphere2.position.z -= 300;
    sphere2.position.x -= 100;

    // add the sphere to the scene
    scene.add(sphere);
    scene.add(sphere2);

    // OVERHEAD VIEW
    var SCENE_HEIGHT = 1.5 * (camera.position.z - sphere2.position.z);
    var SCENE_WIDTH = SCENE_HEIGHT * ASPECT;
    var scale = 4.0;
    var overhead_camera = 
      new THREE.OrthographicCamera(
        SCENE_WIDTH / - 2,
        SCENE_WIDTH / 2,
        SCENE_HEIGHT / 2,
        SCENE_HEIGHT / - 2,
        -2000, 2000);
    overhead_camera.position.x = 0;
    overhead_camera.position.y = 400;
    overhead_camera.position.z = 0;

    overhead_camera.rotation.x =- 0.8;


    scene.add(overhead_camera);

    // OVERLAY: Camera for drawing 2D elements
    var overlay_scene = new THREE.Scene();
    var overlay_camera =
      new THREE.OrthographicCamera(
        WIDTH / - 2,
        WIDTH / 2,
        HEIGHT / 2,
        HEIGHT / - 2,
        -100, 100);

    var line_material = new THREE.MeshBasicMaterial({color: 0xbbbbbb, wireframe:true});
    var vertical_line = new THREE.Mesh( new THREE.PlaneGeometry(HEIGHT, 1), line_material);
    vertical_line.position.z = 0; 
    vertical_line.rotation.z = Math.PI/2;
    overlay_scene.add(overlay_camera);
    overlay_scene.add(vertical_line);

    // create a point light
    var pointLight =
      new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    scene.add(pointLight);

//        function (width, height, near, far, focal_length) 
//        {
//            near = near !== undefined ? near : this.near;
//            far = far !== undefined ? far : this.far;
//
//            var frustum_depth = far - near;
//            var frustum_geom = new THREE.CubeGeometry(this.width, this.height, frustum_depth);
//
//            for(var i = 0; i < geom.vertices.length; ++i)
//            {
//                geom.vertices[i].z += frustum_depth/2 + near;
//                var z = geom.vertices[i].z;
//
//                geom.vertices[i].x *= z;
//                geom.vertices[i].y *= z;
//            }
//
//            var focal_plane = new THREE.Mesh();
//                    new THREE.MeshBasicMaterial({color: 0xEEEE00, transparent: true, opacity: 0.5}));
//            focal_plane.doubleSided = true;
//
//            focal_plane.rotation.x = Math.PI/2;
//            focal_plane.position.z = -camera.fx;
//            focal_plane_pose.rotation = camera.rotation;
//            focal_plane_pose.position = camera.position;
//            focal_plane_pose.add(focal_plane);
//            scene.add(focal_plane_pose);
//
//
//
//            var tm = this.toIntrinsicMatrix();
//            tm.elements[10] = -1;
//            tm.elements[11] = 0;
//            tm.elements[12] = 0;
//            tm.elements[13] = 0;
//            tm.elements[14] = 0;
//            tm.elements[15] = 1;
//
//            tm.getInverse(tm.clone());
//
//            frustum_geom.applyMatrix(tm);
//            focal_plane_geom.applyMatrix(tm);
//
//            this.updateMatrix();
//            frustum_geom.applyMatrix(this.matrix);
//            focal_plane_geom.applyMatrix(tm);
//            return geom;
//        }

    function updateDemo()
    {
        camera.updateMatrix();
        camera.updateProjectionMatrix();
        camera_scene.remove(focal_plane);
        camera_scene.remove(frustum);

        frustum = new THREE.Mesh(
            new THREE.FrustumGeometry(0, frustum_far, camera),
            frustum_material
            );

        focal_plane = new THREE.Mesh(
                new THREE.FocalPlaneGeometry(camera),
                focal_plane_material);
        focal_plane.doubleSided = true;

        camera_scene.add(focal_plane);
        camera_scene.add(frustum);

        cameraCube.position = camera.position;
        cameraCube.rotation = camera.rotation;
        render();
    }

    function render()
    {
        renderer.clear();
        renderer.setViewport(WIDTH,0,WIDTH, HEIGHT);
        renderer.render(scene, camera);

        renderer.setViewport(0,0,WIDTH, HEIGHT);
        renderer.render(scene, overhead_camera);
        renderer.render(camera_scene, overhead_camera);

        renderer.setViewport(0,0,WIDTH*2, HEIGHT);
        renderer.render(overlay_scene, overlay_camera);
    }

    function animate() {

        requestAnimationFrame( animate );
        revolve_t += clock.getDelta();
        revolve_t = REVOLVE_PERIOD / 8;
        while(revolve_t > REVOLVE_PERIOD)
            revolve_t -= REVOLVE_PERIOD;
        overhead_camera.rotationAutoUpdate = true;
        overhead_camera.position.x = REVOLVE_RADIUS * Math.cos(revolve_t/REVOLVE_PERIOD * 2*Math.PI);
        overhead_camera.position.z = REVOLVE_RADIUS * Math.sin(revolve_t/REVOLVE_PERIOD * 2*Math.PI);
        overhead_camera.lookAt(new THREE.Vector3(0,0,-200));
        
        render();

    }

    $("#demo_controls").tabs();

    function reset_demo()
    {
        camera = default_camera.clone();
        init_world_controls();
    }

    function init_world_controls(){
        get_camera_t(camera, camera_t);
        
        // roundabout way of getting inverse euler angles...
        var obj = new THREE.Object3D();
        obj.rotation.copy(camera.rotation);
        obj.updateMatrix();
        var tmp = new THREE.Matrix4();
        tmp.getInverse(obj.matrix);
        obj.matrix.identity();
        obj.applyMatrix(tmp);
        camera_r = obj.rotation;

        world_x_slider.slider("value", camera_t.x);
        world_y_slider.slider("value", camera_t.y);
        world_z_slider.slider("value", -camera_t.z);

        world_rx_slider.slider("value", camera_r.x);
        world_ry_slider.slider("value", camera_r.y);
        world_rz_slider.slider("value", -camera_r.z);
    }

    function get_camera_t(camera, t)
    {
        t.copy(camera.position);
        t.negate();

        var q = new THREE.Quaternion();
        q.setFromEuler(camera.rotation);
        q.multiplyVector3(t);
    }

    // set a camera's extrinsic parameters from 
    // a world transform
    function set_camera_world(camera, t, r)
    {
        camera.rotation.copy(r);
        camera.position.copy(t);
        camera.updateMatrix();

        var tmp = new THREE.Matrix4();
        tmp.getInverse(camera.matrix);
        camera.matrix.identity();
        camera.applyMatrix(tmp);
        camera.updateMatrix();

//        // invert and assign
//        camera.rotation.x = -r.x;
//        camera.rotation.y = -r.y;
//        camera.rotation.z = -r.z;
//        camera.eulerOrder = 'zyx';
//
//        camera.position.copy(t);
//
//        var q = new THREE.Quaternion();
//        q.setFromEuler(camera.rotation);
//        q.multiplyVector3(camera.position);
//        camera.position.negate();
    }

    function set_world_t(camera, r)
    {
        var q = new THREE.Quaternion();
        q.setFromEuler(camera.rotation);
    }


    var world_x_slider = $('#world_x_slider');
    world_x_slider.slider({
        value: camera_t.x,
        min: WORLD_X_MIN,
        max: WORLD_X_MAX,
        slide: function(event, ui) {
            camera_t.x = ui.value;
            set_camera_world(camera, camera_t, camera_r);
            updateDemo();
            return true;
        }
    });

    var world_y_slider = $('#world_y_slider');
    world_y_slider.slider({
        value: camera_t.y,
        min: WORLD_Y_MIN,
        max: WORLD_Y_MAX,
        slide: function(event, ui) {
            camera_t.y = ui.value;
            set_camera_world(camera, camera_t, camera_r);
            updateDemo();
            return true;
        }
    });

    var world_z_slider = $('#world_z_slider');
    world_z_slider.slider({
        value: -camera_t.z,
        min: WORLD_Z_MIN,
        max: WORLD_Z_MAX,
        slide: function(event, ui) {
            camera_t.z = -ui.value;
            set_camera_world(camera, camera_t, camera_r);
            updateDemo();
            return true;
        }
    });

    var world_rx_slider = $('#world_rx_slider');
    world_rx_slider.slider({
        value: camera_r.x,
        min: WORLD_RX_MIN,
        max: WORLD_RX_MAX,
        step: 0.01,
        slide: function(event, ui) {
            camera_r.x = ui.value;

            set_camera_world(camera, camera_t, camera_r);
            updateDemo();
            return true;
        }
    });

    var world_ry_slider = $('#world_ry_slider');
    world_ry_slider.slider({
        value: camera_r.y,
        min: WORLD_RY_MIN,
        max: WORLD_RY_MAX,
        step: 0.01,
        slide: function(event, ui) {
            camera_r.y = ui.value;

            set_camera_world(camera, camera_t, camera_r);
            updateDemo();
            return true;
        }
    });

    var world_rz_slider = $('#world_rz_slider');
    world_rz_slider.slider({
        value: camera_r.z,
        min: WORLD_RZ_MIN,
        max: WORLD_RZ_MAX,
        step: 0.01,
        slide: function(event, ui) {
            camera_r.z = ui.value;

            set_camera_world(camera, camera_t, camera_r);
            updateDemo();
            return true;
        }
    });


    var focal_slider = $('#focal_slider');
    focal_slider.slider({
        value: camera.fx,
        min: FOCAL_MIN,
        max: FOCAL_MAX,
        slide: function(event, ui) {
            camera.fx = ui.value;
            camera.fy = camera.fx;
            focal_plane.position.z = -camera.fx;
            updateDemo();
            return true;
        }
    });

    var skew_slider = $('#skew_slider');
    skew_slider.slider({
        value: camera.s,
        min: SKEW_MIN,
        max: SKEW_MAX,
        step: 0.01,
        slide: function(event, ui) {
            camera.s = ui.value;
            updateDemo();
            return true;
        }
    });

    var x0_slider = $('#x0_slider');
    x0_slider.slider({
        value: camera.x0,
        min: X0_MIN,
        max: X0_MAX,
        slide: function(event, ui) {
            camera.x0 = ui.value;
            updateDemo();
            return true;
        }
    });

    var y0_slider = $('#y0_slider');
    y0_slider.slider({
        value: camera.y0,
        min: Y0_MIN,
        max: Y0_MAX,
        slide: function(event, ui) {
            camera.y0 = ui.value;
            updateDemo();
            return true;
        }
    });



    reset_demo();
    render();
    animate();
});

