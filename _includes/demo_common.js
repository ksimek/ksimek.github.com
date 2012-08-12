<script>

    requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

    var $container;
    var $oh_container;
    var x0, y0, s, fx, fy;
    var rot_y, tx, ty, tz;

    // set the scene size
    var WIDTH = 400,
      HEIGHT = 300;

    // set some camera attributes
    var VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

    // get the DOM element to attach to
    // - assume we've got jQuery to hand

    // create a WebGL renderer, camera
    // and a scene
    var renderer = new THREE.WebGLRenderer();
    var oh_renderer = new THREE.WebGLRenderer();
//            var renderer = new THREE.CanvasRenderer();

    moveParameter = moveCameraCenter;
    //moveParameter = moveCameraPP;
    //moveParameter = zoomCamera;

    var default_focal = HEIGHT / 2 / Math.tan(VIEW_ANGLE * Math.PI / 360);
    var camera =
      new THREE.Othographic

    var camera =
      new THREE.CalibratedCamera(
        default_focal, default_focal,
        0, 0,
        0,
        WIDTH,
        HEIGHT,
        NEAR,
        FAR);

    var overhead_camera = 
      new THREE.OrthographicCamera(
        WIDTH / - 2,
        WIDTH / 2,
        HEIGHT / 2,
        HEIGHT / - 2,
        -2000, 2000);
    overhead_camera.position.x = 0;
    overhead_camera.position.y = 0;
    overhead_camera.position.z = 200;

    overhead_camera.rotation.x = -90 *M_PI / 180;

    var scene = new THREE.Scene();

    // add the camera to the scene
    scene.add(camera);
    scene.add(overhead_camera);

    // the camera starts at 0,0,0
    // so pull it back
    camera.position.z = 300;

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);
    oh_renderer.setSize(WIDTH, HEIGHT);

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

    var sphere2 = new THREE.Mesh(

      new THREE.SphereGeometry(
        radius,
        segments,
        rings),

      sphere2Material);

    sphere2.position.z -= 100;
    sphere2.position.x -= 100;

    // add the sphere to the scene
    scene.add(sphere);
    scene.add(sphere2);

    // create a point light
    var pointLight =
      new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    scene.add(pointLight);

    function render_camera()
    {
        renderer.render(scene, camera);
        oh_renderer.render(scene, overhead_camera);
    }


    // attach the render-supplied DOM element
    $(document).ready(function(){
        $container = $('#camera_view');
        $oh_container = $('#overhead_view');
        $container.prepend(renderer.domElement);
        $oh_container.prepend(oh_renderer.domElement);

        render();
    });

</script>
