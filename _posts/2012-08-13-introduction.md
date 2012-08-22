---
layout: post
title: "The Perspective Camera - An Interactive Tour"
#published: false
description: ""
category: 
tags: []
---

<div class='context-img' style='width:350px'>
<img src='/img/1st_and_ten.jpg' />
<div class='caption'>The "1st and Ten" system, one of the first successful applications of augmented reality in sports.
<div class='credit'><a href="http://www.howstuffworks.com/first-down-line.htm">howstuffworks.com</a></div>
</div>
</div>

On September 27, 1998 a yellow line appeared across the gridiron during an otherwise ordinary football game between the Cincinnati Bengals and the Baltimore Ravens.  It had been added by a computer that analyzed the camera's position and the shape of the ground in real-time in order to overlay thin yellow strip onto the field.  The line marked marked the position of the next first-down, but it also marked the beginning of a new era of computer vision in live sports, from [computerized pitch analysis](http://www.youtube.com/watch?v=p-y7N-giirQ) in baseball to [automatic line-refs](http://www.youtube.com/watch?v=Cgeb61VIKvo) in tennis.  

In 2006, researchers from Microsoft and the University of Washington [automatically constructed a 3D tour of the Trevi Fountain in Rome](http://www.youtube.com/watch?v=IgBQCoEfiMs) using only images obtained by searching Flickr for "trevi AND rome."

In 2007, Carnegie Mellon PhD student Johnny Lee [hacked a $40 Nintento Wii-mote](http://www.youtube.com/watch?v=Jd3-eiid-Uw) into an impressive head-tracking virtual reality interface.

In 2010, [Microsoft released the Kinect](http://en.wikipedia.org/wiki/Kinect), a consumer stereo camera that rivaled the functionality of competitors sold for ten times its price, which continues to disrupt the worlds of both gaming and computer vision.

What do all of these technologies have in common?  They all require a precise understanding of how the pixels in a 2D image relate to the 3D world they represent.  In other words, they all hinge on a strong camera model.  This is the first in a series of articles that explores one of the most important camera models in computer vision: the pinhole perspective camera.  We'll start by deconstructing the perspective camera to show how each of its parts affect the rendering of a 3D scene.  Next, we'll describe how to import your calibrated camera into OpenGL to render virtual objects into a real image.  Finally, we'll show how to use your perspective camera to implement rendering in a virtual-reality system, complete with stereo rendering and head-tracking.

<div class='context-img' style='width:180px'>
    <a href="http://www.robots.ox.ac.uk/~vgg/hzbook/">
    <img src='/img/h_and_z.jpg' />
    </a>
    <div class='caption'>
        These articles won't cover everything.  This book does.
    </div>
</div>
This series of articles is intended as a supplement to a more rigorous treatment available in several excellent textbooks.  I will focus on providing what textbooks generally don't provide: interactive demos, runnable code, and practical advice on implementation.    I will assume the reader has a basic understanding of 3D graphics and OpenGL, as well as some background in computer vision.  In other words, if you've never heard of homogeneous coordinates or a camera matrix, you might want to start with an introductory book on computer vision.  I highly recommend [Multiple View Geometry in Computer Vision](http://www.amazon.com/Multiple-View-Geometry-Computer-Vision/dp/0521540518/ref=sr_1_fkmr1_1?ie=UTF8&qid=1343611611&sr=8-1-fkmr1&keywords=harley+and+zisserman) by Hartley and Zisserman, from which I borrow mathematical notation and conventions (e.g. column vectors, right-handed coordinates, etc.)

<!--more-->

Technical Requirements
-----------------------

Equations in these articles are typeset using MathJax, which won't display if you've disabled JavaScript or [are using a browser that is woefully out of date](http://www.mathjax.org/resources/browser-compatibility/) (sorry IE 5 users).  If everything is working, you should see a matrix below:

<div>
\[
\left (
\begin{array}{c c c}
a^2 &  b^2 & c^2 \\
d^2 &  e^2 & f^2 \\
g^2 &  h^2 & i^2
\end{array}
\right )
\]
</div>

3D interactive demos are provided by [three.js](https://github.com/mrdoob/three.js/), which also needs JavaScript and prefers a browser that supports WebGL ( [Google Chrome](http://google.com/chrome) works great, as does [the latest version of Firefox](http://www.mozilla.org/en-US/firefox/fx/#desktop)).  Older browsers will render using canvas, which will run slowly, look ugly, and hurl vicious insults at you.  But it should work.   If you see two spheres below, you're in business.

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
    var mouseDX = 0, mouseDY = 0;
    var mouseDownX, mouseDownY;
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
//            var renderer = new THREE.CanvasRenderer();

    moveParameter = moveCameraCenter;
    //moveParameter = moveCameraPP;
    //moveParameter = zoomCamera;

    var default_focal = HEIGHT / 2 / Math.tan(VIEW_ANGLE * Math.PI / 360);
    var camera =
      new THREE.CalibratedCamera(
        default_focal, default_focal,
        0, 0,
        0,
        WIDTH,
        HEIGHT,
        NEAR,
        FAR);

    var scene = new THREE.Scene();

    // add the camera to the scene
    scene.add(camera);

    // the camera starts at 0,0,0
    // so pull it back
    camera.position.z = 300;

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);

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

    function onMouseDown(event)
    {
        $(document).mousemove(onMouseMove);
        $(document).mouseup(onMouseUp);
        $(document).mouseout(onMouseOut);

        mouseDownX = event.screenX;
        mouseDownY = event.screenY;
    }

    function onMouseMove(event)
    {
        var mouseX = event.screenX;
        var mouseY = event.screenY;
        
        var mouseDX = mouseX - mouseDownX;
        var mouseDY = mouseY - mouseDownY;

        moveParameter(mouseDX, mouseDY);
        render();
    }


    function onMouseOut(event)
    {
        removeListeners();
    }

    function onMouseUp(event)
    {
        removeListeners();
    }

    function removeListeners()
    {
        $(document).unbind( 'mousemove');
        $(document).unbind( 'mouseup');
        $(document).unbind( 'mouseout');
    }

    function onTouchStart(event)
    {
        if ( event.touches.length == 1 ) {

            event.preventDefault();

            mouseDownX = event.touches[ 0 ].pageX;
            mouseDownY = event.touches[ 0 ].pageY;
        }
    }

    function onTouchMove(event)
    {
        if ( event.touches.length == 1 ) {

            event.preventDefault();

            var mouseX = event.touches[ 0 ].pageX;
            var mouseY = event.touches[ 0 ].pageY;

            var mouseDX = mouseX - mouseDownX;
            var mouseDY = mouseY - mouseDownY;

            moveParameter(mouseDX, mouseDY);
            render();
        }
    }

    function zoomCamera(param1, param2)
    {
        camera.fx = default_focal + 2*param2;
        camera.fy = default_focal + 2*param2;
        camera.s = -2*param1;
        camera.updateProjectionMatrix();
    }

    // move camera's principal point
    function moveCameraPP(param1, param2)
    {
        camera.x0 = param1;
        camera.y0 = -param2;
        camera.updateProjectionMatrix();
    }

    function moveCameraCenter(param1, param2)
    {
        camera.position.x =  param1;
        camera.position.y = -param2;
    }

    function animLoop() 
    {
        requestAnimFrame(animLoop);
        render();
    }

    function render()
    {
        renderer.render(scene, camera);
    }


    // attach the render-supplied DOM element
    $(document).ready(function(){
        $container = $('#3d_container');
        $container.prepend(renderer.domElement);

        $container.mousedown(onMouseDown);
        $container.bind( 'touchstart', onTouchStart);
        $container.bind( 'touchmove', onTouchMove);

        render();
    });

</script>


<div class="demo_3d">
    <div id="3d_container" >
    </div>
    <div class="caption">3D demo.  Drag to move camera. </div>
</div>

<a name="toc"></a>
<h2>Table of Contents  </h2>

Below is a list of all the articles in this series.  New articles will be added to this list as I post them, so you can always return to this page for an up-to-date listing.

* [Dissecting the Camera Matrix, Part 1: Intrinsic/Extrinsic Decomposition](/2012/08/14/decompose/)
* [Dissecting the Camera Matrix, Part 2: The Extrinsic Matrix](/2012/08/22/extrinsic/)
* Dissecting the Camera Matrix, Part 3: The Intrinsic Matrix
* Simulating your Calibrated Camera in OpenGL
* Stereo Rendering using a Calibrated Camera
* Head-tracked Display using a Calibrated Camera
{% comment %}
* Pixel-perfect Backprojected Textures
* Rendering a Pixel-Perfect Image Plane
{% endcomment %}

Happy reading!
