$(document).ready(function(){
    var $container;
// attach the render-supplied DOM element


    $container = $('#3d_container');
    
    var lookat_mode = 0;
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
    var FOCAL_MAX = default_focal * 4;
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

    var WORLD_X_MIN = -300;
    var WORLD_X_MAX =  300;
    var WORLD_Y_MIN = -300;
    var WORLD_Y_MAX =  300;
    var WORLD_Z_MIN =   50;
    var WORLD_Z_MAX =  700;

    var CAMERA_RX_MIN = -Math.PI/6;
    var CAMERA_RX_MAX =  Math.PI/6;
    var CAMERA_RY_MIN = -Math.PI/6;
    var CAMERA_RY_MAX =  Math.PI/6;
    var CAMERA_RZ_MIN = -Math.PI/6;
    var CAMERA_RZ_MAX =  Math.PI/6;

    var CAMERA_X_MIN = -300;
    var CAMERA_X_MAX =  300;
    var CAMERA_Y_MIN = -300;
    var CAMERA_Y_MAX =  300;
    var CAMERA_Z_MIN =  50;
    var CAMERA_Z_MAX =  700;

    var LOOKAT_PX_MIN = -300
    var LOOKAT_PX_MAX =  300
    var LOOKAT_PY_MIN = -300
    var LOOKAT_PY_MAX =  300
    var LOOKAT_PZ_MIN = -300
    var LOOKAT_PZ_MAX =  300
    
    var ASPECT = WIDTH / HEIGHT,
      NEAR = WORLD_Z_MIN,
      FAR = 1000;

    // get the DOM element to attach to
    // - assume we've got jQuery to hand

    // create a WebGL renderer, camera
    // and a scene
    
    if(!Detector.webgl)
    {
        Detector.addGetWebGLMessage({parent: $('#webgl_error').get(0)});
        $('.demo_3d').remove();
        return;
    }

    $('.demo_3d').show();

    // start the renderer
    var renderer = new THREE.WebGLRenderer();
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

    var lookat_p = new THREE.Vector3(0,0,0);

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
            75,
            75,
            37.5),
          cameraCubeMaterial);
    cameraCube.position = camera.position;
    cameraCube.rotation = camera.rotation;
    camera_scene.add(cameraCube);

    var pAxisMaterial = new THREE.LineBasicMaterial({ color: 0x66cc66});

    var pAxisGeometry = new THREE.Geometry();

    var pAxis = camera.matrix.getColumnZ().clone();
    pAxis.normalize();
    pAxis.multiplyScalar(-FOCAL_MAX); // end at far plane
    pAxis.addSelf(camera.position);
    pAxisGeometry.vertices.push(camera.position.clone());
    pAxisGeometry.vertices.push(pAxis);
    var principal_axis = new THREE.Line(
            pAxisGeometry,
            pAxisMaterial);

    camera_scene.add(principal_axis);

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

    // add the "lookat" indicator sphere 
    scene.add(sphere);
    scene.add(sphere2);

    var lookat_point = new THREE.Mesh(

      new THREE.SphereGeometry(
        20,
        4,
        4),

      new THREE.MeshBasicMaterial({color: 0xff6600}));
    camera_scene.add(lookat_point);
    // hide it for now
    lookat_point.position.x = 10000;
    lookat_point.position.y = 10000;
    lookat_point.position.z = 10000;

    // OVERHEAD VIEW
    var SCENE_HEIGHT = 2 * (camera.position.z - sphere2.position.z);
    var SCENE_WIDTH = SCENE_HEIGHT * ASPECT;
    var overhead_camera = 
      new THREE.OrthographicCamera(
        SCENE_WIDTH / - 2,
        SCENE_WIDTH / 2,
        SCENE_HEIGHT / 2,
        SCENE_HEIGHT / - 2,
        -4000, 4000);
    overhead_camera.position.y = 400;

    revolve_t = REVOLVE_PERIOD / 8;
    overhead_camera.position.x = REVOLVE_RADIUS * Math.cos(revolve_t/REVOLVE_PERIOD * 2*Math.PI);
    overhead_camera.position.z = REVOLVE_RADIUS * Math.sin(revolve_t/REVOLVE_PERIOD * 2*Math.PI);
    overhead_camera.lookAt(new THREE.Vector3(0,0,(camera.position.z - FOCAL_MAX)/2.0));

    scene.add(overhead_camera);
    camera_scene.add(overhead_camera);

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
        camera_scene.remove(principal_axis);

        frustum = new THREE.Mesh(
            new THREE.FrustumGeometry(0, frustum_far, camera),
            frustum_material
            );

        focal_plane = new THREE.Mesh(
                new THREE.FocalPlaneGeometry(camera),
                focal_plane_material);
        focal_plane.doubleSided = true;

        var p1 = camera.position.clone();
        var p2 = camera.matrix.getColumnZ().clone();
        p2.normalize();
        p2.multiplyScalar(-FOCAL_MAX); // end at far plane
        p2.addSelf(p1);
        pAxisGeometry = new THREE.Geometry();
        pAxisGeometry.vertices.push(p1);
        pAxisGeometry.vertices.push(p2);
        principal_axis = new THREE.Line(
            pAxisGeometry,
            pAxisMaterial);

        camera_scene.add(principal_axis);

        if(lookat_mode)
        {
            lookat_point.position = lookat_p.clone();
        }
        else
        {
            lookat_point.position.x = 100000;
            lookat_point.position.y = 100000;
            lookat_point.position.z = 100000;
        }

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

    function reset_demo()
    {
        camera = default_camera.clone();
        init_world_controls();
        init_camera_controls();
        init_lookat_controls();
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
        world_z_slider.slider("value", camera_t.z);

        world_rx_slider.slider("value", camera_r.x);
        world_ry_slider.slider("value", camera_r.y);
        world_rz_slider.slider("value", camera_r.z);
    }

    function init_camera_controls()
    {
        camera_x_slider.slider("value", camera.position.x);
        camera_y_slider.slider("value", camera.position.y);
        camera_z_slider.slider("value", camera.position.z);

        camera_rx_slider.slider("value", camera.rotation.x);
        camera_ry_slider.slider("value", camera.rotation.y);
        camera_rz_slider.slider("value", camera.rotation.z);
    }

    function init_lookat_controls() {
        lookat_p = camera.matrix.getColumnZ().clone();
        lookat_p.normalize();
        lookat_p.multiplyScalar(-FOCAL_MAX/2.0);
        lookat_p.addSelf(camera.position);

        lookat_x_slider.slider("value", camera.position.x);
        lookat_y_slider.slider("value", camera.position.y);
        lookat_z_slider.slider("value", camera.position.z);

        lookat_px_slider.slider("value", lookat_p.x);
        lookat_py_slider.slider("value", lookat_p.y);
        lookat_pz_slider.slider("value", lookat_p.z);
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
        value: camera_t.z,
        min: -WORLD_Z_MAX,
        max: -WORLD_Z_MIN,
        slide: function(event, ui) {
            camera_t.z = ui.value;
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

    var camera_x_slider = $('#camera_x_slider');
    camera_x_slider.slider({
        value: camera.position.x,
        min: CAMERA_X_MIN,
        max: CAMERA_X_MAX,
        slide: function(event, ui) {
            camera.position.x = ui.value;
            updateDemo();
            return true;
        }
    });

    var camera_y_slider = $('#camera_y_slider');
    camera_y_slider.slider({
        value: camera.position.y,
        min: CAMERA_Y_MIN,
        max: CAMERA_Y_MAX,
        slide: function(event, ui) {
            camera.position.y = ui.value;
            updateDemo();
            return true;
        }
    });

    var camera_z_slider = $('#camera_z_slider');
    camera_z_slider.slider({
        value: camera.position.z,
        min: CAMERA_Z_MIN,
        max: CAMERA_Z_MAX,
        slide: function(event, ui) {
            camera.position.z = ui.value;
            updateDemo();
            return true;
        }
    });

    var camera_rx_slider = $('#camera_rx_slider');
    camera_rx_slider.slider({
        value: camera_r.x,
        min: CAMERA_RX_MIN,
        max: CAMERA_RX_MAX,
        step: 0.01,
        slide: function(event, ui) {
            camera.rotation.x = ui.value;
            updateDemo();
            return true;
        }
    });

    var camera_ry_slider = $('#camera_ry_slider');
    camera_ry_slider.slider({
        value: camera_r.y,
        min: CAMERA_RY_MIN,
        max: CAMERA_RY_MAX,
        step: 0.01,
        slide: function(event, ui) {
            camera.rotation.y = ui.value;
            updateDemo();
            return true;
        }
    });

    var camera_rz_slider = $('#camera_rz_slider');
    camera_rz_slider.slider({
        value: camera_r.z,
        min: CAMERA_RZ_MIN,
        max: CAMERA_RZ_MAX,
        step: 0.01,
        slide: function(event, ui) {
            camera.rotation.z = ui.value;
            updateDemo();
            return true;
        }
    });

    var lookat_x_slider = $('#lookat_x_slider');
    lookat_x_slider.slider({
        value: camera.position.x,
        min: CAMERA_X_MIN,
        max: CAMERA_X_MAX,
        slide: function(event, ui) {
            camera.position.x = ui.value;
            camera.lookAt(lookat_p);
            updateDemo();
            return true;
        }
    });

    var lookat_y_slider = $('#lookat_y_slider');
    lookat_y_slider.slider({
        value: camera.position.y,
        min: CAMERA_Y_MIN,
        max: CAMERA_Y_MAX,
        slide: function(event, ui) {
            camera.position.y = ui.value;
            camera.lookAt(lookat_p);
            updateDemo();
            return true;
        }
    });

    var lookat_z_slider = $('#lookat_z_slider');
    lookat_z_slider.slider({
        value: camera.position.z,
        min: CAMERA_Z_MIN,
        max: CAMERA_Z_MAX,
        slide: function(event, ui) {
            camera.position.z = ui.value;
            camera.lookAt(lookat_p);
            updateDemo();
            return true;
        }
    });

    var lookat_px_slider = $('#lookat_px_slider');
    lookat_px_slider.slider({
        value: lookat_p.x,
        min: LOOKAT_PX_MIN,
        max: LOOKAT_PX_MAX,
        step: 0.01,
        slide: function(event, ui) {
            lookat_p.x = ui.value;
            camera.lookAt(lookat_p);
            updateDemo();
            return true;
        }
    });

    var lookat_py_slider = $('#lookat_py_slider');
    lookat_py_slider.slider({
        value: lookat_p.y,
        min: LOOKAT_PY_MIN,
        max: LOOKAT_PY_MAX,
        step: 0.01,
        slide: function(event, ui) {
            lookat_p.y = ui.value;
            camera.lookAt(lookat_p);
            updateDemo();
            return true;
        }
    });

    var lookat_pz_slider = $('#lookat_pz_slider');
    lookat_pz_slider.slider({
        value: lookat_p.z,
        min: LOOKAT_PZ_MIN,
        max: LOOKAT_PZ_MAX,
        step: 0.01,
        slide: function(event, ui) {
            lookat_p.z = ui.value;
            camera.lookAt(lookat_p);
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

    $("#demo_controls").tabs({
        show: function(event, ui){
            if(ui.index == 0)
            {
                init_world_controls();
                lookat_mode = 0;
            }
            if(ui.index == 1)
            {
                init_camera_controls();
                lookat_mode = 0;
            }
            if(ui.index == 2)
            {
                init_lookat_controls();
                lookat_mode = 1;
            }

            updateDemo();
        }
    });



    reset_demo();
    render();
    //animate();
});

