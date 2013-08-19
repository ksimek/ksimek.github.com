---
layout: post
title: "Dissecting the Camera Matrix, Part 3: The Intrinsic Matrix"
description: ""
category: 
tags: []
latex_math: true
jquery_ui: true
three_js: true
edit:  "Author's note: the source file for all of this post's diagrams <a href=\"/pinhole_camera_diagram/\">is available under a creative commons license</a>.  Please feel free to modify and share!"
---

{% include JB/setup %}

<div class="clearer"></div>
<div class='context-img' style='width:320px'>
<img src='/img/kodak-camera.jpg' />
<div class='caption'>
<div class='credit'><a href="http://www.flickr.com/photos/alhazen/8587124359/">Credit: Dave6163 (via Flickr)</a></div>
</div>
</div>

Today we'll study the intrinsic camera matrix in our third and final chapter in the trilogy "Dissecting the Camera Matrix."  In [the first article]({{site.baseurl}}/2012/08/14/decompose/), we learned how to split the full camera matrix into the intrinsic and extrinsic matrices and how to properly handle ambiguities that arise in that process.  The [second article]({{site.baseurl}}/2012/08/22/extrinsic/) examined the extrinsic matrix in greater detail, looking into several different interpretations of its 3D rotations and translations.   Today we'll give the same treatment to the intrinsic matrix, examining two equivalent interpretations: as a description of the virtual camera's geometry and as a sequence of simple 2D transformations.   Afterward, you'll see an interactive demo illustrating both interpretations.

If you're not interested in delving into the theory and just want to use your intrinsic matrix with OpenGL, check out the articles [Calibrated Cameras in OpenGL without glFrustum]({{site.baseurl}}/2013/06/03/calibrated_cameras_in_opengl/) and [Calibrated Cameras and gluPerspective]({{site.baseurl}}/2013/06/18/calibrated-cameras-and-gluperspective/).

All of these articles are part of the series "[The Perspective Camera, an Interactive Tour]({{site.baseurl}}/2012/08/13/introduction/)."  To read the other entries in the series, [head over to the table of contents]({{site.baseurl}}/2012/08/13/introduction/#toc).

<!--more-->

The Pinhole Camera
==============================

The intrinsic matrix transforms 3D camera cooordinates to 2D homogeneous image coordinates.  This perspective projection is modeled by the ideal pinhole camera, illustrated below. 

![pinhole camera]({{site.baseurl}}/img/intrinsic-pinhole-camera.png)

The intrinsic matrix is parameterized by [Hartley and Zisserman](http://www.robots.ox.ac.uk/~vgg/hzbook/) as
    
<div>
    \[
    K = \left ( 
                \begin{array}{ c c c}
                f_x & s   & x_0 \\
                 0  & f_y & y_0 \\
                 0  & 0   & 1 \\
                \end{array}
            \right ) 
    \]
</div>

Each intrinsic parameter describes a geometric property of the camera.  Let's examine each of these properties in detail.

Focal Length, \\(f_x\\), \\(f_y\\)
-------------
The focal length is the distance between the pinhole and the film (a.k.a. image plane).  For reasons we'll discuss later, the focal length is measured in pixels.  In a true pinhole camera, both \\(f_x\\) and \\(f_y\\) have the same value, which is illustrated as \\(f\\) below.

![focal length]({{site.baseurl}}/img/intrinsic-focal-length.png)

In practice, \\(f_x\\) and \\(f_y\\) can differ for a number of reasons:
    
* Flaws in the digital camera sensor.
* The image has been non-uniformly scaled in post-processing.
* The camera's lens introduces unintentional distortion.
* The camera uses an [anamorphic format](http://en.wikipedia.org/wiki/Anamorphic_format), where the lens compresses a widescreen scene into a standard-sized sensor.
* Errors in camera calibration.

In all of these cases, the resulting image has non-square pixels.

Having two different focal lengths isn't terribly intuitive, so some texts (e.g. [Forsyth and Ponce](http://luthuli.cs.uiuc.edu/~daf/book/book.html)) use a single focal length and an "aspect ratio" that describes the amount of deviation from a perfectly square pixel. Such a parameterization nicely separates the camera geometry (i.e. focal length) from distortion (aspect ratio).

Principal Point Offset, \\(x_0\\), \\(y_0\\)
--------------------------
The camera's "principal axis" is the line perpendicular to the image plane that passes through the pinhole.  Its itersection with the image plane is referred to as the "principal point," illustrated below.

![Principal point and principal axis]({{site.baseurl}}/img/intrinsic-pp.png)

The "principal point offset" is the location of the principal point relative to the film's origin.  The exact definition depends on which convention is used for the location of the origin; the illustration below assumes it's at the bottom-left of the film.

![Principal point offset]({{site.baseurl}}/img/intrinsic-pp-offset.png)

Increasing \\(x_0\\) shifts the pinhole to the right:

![Principal point offset, pinhole shifted right]({{site.baseurl}}/img/intrinsic-pp-offset-delta-alt.png)
    
This is equivalent to shifting the film to the left and leaving the pinhole unchanged.

![Principal point offset, film shifted left]({{site.baseurl}}/img/intrinsic-pp-offset-delta.png)

Notice that the box surrounding the camera is irrelevant, only the pinhole's position relative to the film matters.

Axis Skew, \\(s\\)
----------------------

Axis skew causes shear distortion in the projected image.  As far as I know, there isn't any analogue to axis skew a true pinhole camera, but [apparently some digitization processes can cause nonzero skew](http://www.epixea.com/research/multi-view-coding-thesisse8.html#x13-320002.2.1).  We'll examine skew more later.

Other Geometric Properties
---------------

The focal length and principal point offset amount to simple translations of the film relative to the pinhole.  There must be other ways to transform the camera, right?  What about rotating or scaling the film?  

Rotating the film around the pinhole is equivalent to rotating the camera itself, which is handled by the [extrinsic matrix]({{site.baseurl}}/2012/08/22/extrinsic/).  Rotating the film around any other fixed point \\(x\\) is equivalent to rotating around the pinhole \\(P\\), then translating by \\((x-P)\\).


What about scaling? It should be obvious that doubling all camera dimensions (film size and focal length) has no effect on the captured scene.  If instead, you double the film size and *not* the focal length, it is equivalent to doubling both (a no-op) and then halving the focal length.  Thus, representing the film's scale explicitly would be redundant; it is captured by the focal length.

Focal Length - From Pixels to World Units
------------------------------------------

This discussion of camera-scaling shows that there are an infinite number of pinhole cameras that produce the same image.  The intrinsic matrix is only concerned with the relationship between camera coordinates and image coordinates, so the absolute camera dimensions are irrelevant.  Using pixel units for focal length and principal point offset allows us to represent the relative dimensions of the camera, namely, the film's position relative to its size in pixels.

Another way to say this is that the intrinsic camera transformation is invariant to uniform scaling of the camera geometry.   By representing dimensions in pixel units, we naturally capture this invariance.  

You can use similar triangles to convert pixel units to world units (e.g. mm) if you know at least one camera dimension in world units.  For example, if you know the camera's film (or digital sensor) has a width \\(W\\) in millimiters, and the image width in pixels is \\(w\\), you can convert the focal length \\(f_x\\) to world units using: 
        
<div> \[ F_x = f_x  \frac{W}{w} \] </div>

Other parameters \\(f_y\\), \\(x_0\\), and \\(y_0\\) can be converted to their world-unit counterparts \\(F_y\\), \\(X_0\\), and \\(Y_0\\) using similar equations:

<div> \[
\begin{array}{ccc}
F_y = f_y  \frac{H}{h} \qquad
X_0 = x_0  \frac{W}{w} \qquad
Y_0 = y_0  \frac{H}{h} 
\end{array}
\] </div>

The Camera Frustum - A Pinhole Camera Made Simple
======
As we discussed earlier, only the arrangement of the pinhole and the film matter, so the physical box surrounding the camera is irrelevant.  For this reason, many discussion of camera geometry use a simpler visual representation: the camera frustum.   

The camera's viewable region is pyramid shaped, and is sometimes called the "visibility cone."  Lets add some 3D spheres to our scene and show how they fall within the visibility cone and create an image.

![frustum]({{site.baseurl}}/img/intrinsic-frustum.png)

Since the camera's "box" is irrelevant, let's remove it.  Also, note that the film's image depicts a mirrored version of reality.  To fix this, we'll use a "virtual image" instead of the film itself.  The virtual image has the same properties as the film image, but unlike the true image, the virtual image appears in front of the camera, and the projected image is unflipped.

![frustum without camera box]({{site.baseurl}}/img/intrinsic-frustum-no-box.png)

Note that the position and size of the virtual image plane is arbitrary &mdash; we could have doubled its size as long as we also doubled its distance from the pinhole.  

After removing the true image we're left with the "viewing frustum" representation of our pinhole camera.

![frustum representation, final ]({{site.baseurl}}/img/intrinsic-frustum-final.png)

The pinhole has been replaced by the tip of the visibility cone, and the film is now represented by the virtual image plane.  We'll use this representation for our demo later.

Intrinsic parameters as 2D transformations
===========================================

In the previous sections, we interpreted our incoming 3-vectors as 3D image coordinates, which are transformed to homogeneous 2D image coordinates.  Alternatively, we can interpret these 3-vectors as 2D homogeneous coordinates which are transformed to a new set of 2D points.  This gives us a new view of the intrinsic matrix: a sequence of 2D affine transformations.  

We can decompose the intrinsic matrix into a sequence of shear, scaling, and translation transformations, corresponding to axis skew, focal length, and principal point offset,  respectively:
    
<div>
\[
    \begin{align}
    K &= \left ( 
                \begin{array}{ c c c}
                f_x & s   & x_0 \\
                 0  & f_y & y_0 \\
                 0  & 0   & 1 \\
                \end{array}
            \right ) 
        \\[0.5em]
        &=
            \underbrace{
                \left (
                \begin{array}{ c c c}
                 1  &  0  & x_0 \\
                 0  &  1  & y_0 \\
                 0  &  0  & 1
                \end{array}
                \right )
            }_\text{2D Translation}

            \times

            \underbrace{
                \left (
                \begin{array}{ c c c}
                f_x &  0  & 0 \\
                 0  & f_y & 0 \\
                 0  &  0  & 1
                \end{array}
                \right )
            }_\text{2D Scaling}

            \times

            \underbrace{
                \left (
                \begin{array}{ c c c}
                 1  &  s/f_x  & 0 \\
                 0  &    1    & 0 \\
                 0  &    0    & 1
                \end{array}
                \right )
            }_\text{2D Shear}

    \end{align}
\]
</div>

An equivalent decomposition places shear *after* scaling:

<div>
\[
    \begin{align}
        K &=
            \underbrace{
                \left (
                \begin{array}{ c c c}
                 1  &  0  & x_0 \\
                 0  &  1  & y_0 \\
                 0  &  0  & 1
                \end{array}
                \right )
            }_\text{2D Translation}

            \times

            \underbrace{
                \left (
                \begin{array}{ c c c}
                 1  &  s/f_y  & 0 \\
                 0  &    1    & 0 \\
                 0  &    0    & 1
                \end{array}
                \right )
            }_\text{2D Shear}

            \times

            \underbrace{
                \left (
                \begin{array}{ c c c}
                f_x &  0  & 0 \\
                 0  & f_y & 0 \\
                 0  &  0  & 1
                \end{array}
                \right )
            }_\text{2D Scaling}
    \end{align}
\]
</div>

This interpretation nicely separates the extrinsic and intrinsic parameters into the realms of 3D and 2D, respactively.  It also emphasizes that the intrinsic camera transformation occurs *post-projection*.  One notable result of this is that **intrinsic parameters cannot affect visibility** &mdash; occluded objects cannot be revealed by simple 2D transformations in image space.

Demo
=======

The demo below illustrates both interpretations of the intrinsic matrix.  On the left is the "camera-geometry" interpretation.  Notice how the pinhole moves relative to the image plane as \\(x_0\\) and \\(y_0\\) are adjusted.

On the right is the "2D transformation" interpretation.  Notice how changing focal length results causes the projected image to be scaled and changing principal point results in pure translation.  

<script type="text/javascript" src="/js/geometry/FocalPlaneGeometry.js"></script>
<script type="text/javascript" src="/js/geometry/FrustumGeometry.js"></script>
<script type="text/javascript" src="/js/cam_demo.js"></script>

<div id="webgl_error"></div>
<div id="javascript_error">Javascript is required for this demo.</div>
<div class="demo_3d" style="display:none">
    <table style="width: 100%"><tr style="text-align:center;"><td width="50%">Scene</td><td>Image</td></tr></table>
    <div id="3d_container" >
    </div>
    <div class="caption">
    <em>Left</em>: scene with camera and viewing volume.  Virtual image plane is shown in yellow.   <em>Right</em>: camera's image.</div>
    <div id="demo_controls">
        <ul>
            <li><a href="#intrinsic-controls">Intrinsic</a></li>
        </ul>
        <div id="intrinsic-controls">
            <div class="slider-control">
                <div class="slider" id="focal_slider">
                </div>
                <div class="slider-label">
                Focal Length
                </div>
                <div class="clearer"></div>
            </div>
            <div class="slider-control">
                <div class="slider" id="skew_slider">
                </div>
                <div class="slider-label">
                Axis Skew 
                </div>
                <div class="clearer"></div>
            </div>
            <div class="slider-control">
                <div class="slider" id="x0_slider">
                </div>
                <div class="slider-label">
                \(x_0\)
                </div>
                <div class="clearer"></div>
            </div>
            <div class="slider-control">
                <div class="slider" id="y0_slider">
                </div>
                <div class="slider-label">
                \(y_0\)
                </div>
                <div class="clearer"></div>
            </div>
            
        </div>
    </div>
</div>

<br />

Dissecting the Camera Matrix, A Summary
=========================================

Over the course of this series of articles we've seen how to decompose

1. [the full camera matrix into intrinsic and extrinsic matrices]({{site.baseurl}}/2012/08/14/decompose/),
2. [the extrinsic matrix into 3D rotation followed by translation]({{site.baseurl}}/2012/08/22/extrinsic/), and
3. the intrinsic matrix into three basic 2D transformations.

We summarize this full decomposition below.

<div>
\[
    \begin{align}
    P &= \overbrace{K}^\text{Intrinsic Matrix} \times \overbrace{[R \mid  \mathbf{t}]}^\text{Extrinsic Matrix} \\[0.5em]
     &= 
        \overbrace{

            \underbrace{
                \left (
                \begin{array}{ c c c}
                 1  &  0  & x_0 \\
                 0  &  1  & y_0 \\
                 0  &  0  & 1
                \end{array}
                \right )
            }_\text{2D Translation}

            \times

            \underbrace{
                \left (
                \begin{array}{ c c c}
                f_x &  0  & 0 \\
                 0  & f_y & 0 \\
                 0  &  0  & 1
                \end{array}
                \right )
            }_\text{2D Scaling}

            \times

            \underbrace{
                \left (
                \begin{array}{ c c c}
                 1  &  s/f_x  & 0 \\
                 0  &    1    & 0 \\
                 0  &    0    & 1
                \end{array}
                \right )
            }_\text{2D Shear}

        }^\text{Intrinsic Matrix}

        \times

        \overbrace{
        \underbrace{
             \left( \begin{array}{c | c} 
            I & \mathbf{t}
             \end{array}\right)
        }_\text{3D Translation}
        \times
        \underbrace{
             \left( \begin{array}{c | c} 
            R & 0 \\ \hline
            0 & 1
             \end{array}\right)
        }_\text{3D Rotation}
        }^\text{Extrinsic Matrix}
    \end{align}
\]
</div>

To see all of these transformations in action, head over to my [Perpective Camera Toy]({{site.baseurl}}/perspective_camera_toy.html) page for an interactive demo of the full perspective camera.

Do you have other ways of interpreting the intrinsic camera matrix?   Leave a comment or [drop me a line]({{site.baseurl}}/contact.html)!


Next time, we'll show how to prepare your calibrated camera to generate stereo image pairs.  See you then!

