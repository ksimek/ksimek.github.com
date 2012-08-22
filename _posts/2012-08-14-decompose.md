---
layout: post
title: "Dissecting the Camera Matrix, Part 1: Extrinsic/Intrinsic Decomposition"
description: ""
---
<div class="clearer"></div>
<div class='context-img' style='width:320px'>
<img src='/img/decompose.jpg' />
<div class='caption'>Not this kind of decomposition.
<div class='credit'><a href="http://www.flickr.com/photos/dhollister/2596483147/">Credit: Daniel Hollister</a></div>
</div>
</div>
So, you've been playing around a new computer vision library, and you've managed to calibrate your camera.  You now have a 3x4 matrix...  what do you do with it?  It would be a lot more useful if you could get at the camera's position or find out it's field-of view.  You crack open your trusty copy of [Hartley and Zisserman](http://www.robots.ox.ac.uk/~vgg/hzbook/), which tells you how to decompose your camera into an intrinsic and extrinsic matrix --- great! But when you look at the results, something isn't quite right.  Maybe your rotation matrix has a determinant of -1, causing your matrix-to-quaternion function to barf.  Maybe your focal-length is negative, and you can't understand why.  Maybe your translation vector mistakenly claims that the world origin in _behind_ the camera.  Or worst of all, everything looks fine, but when you plug it into OpenGL, you just don't see _anything_.  

Today we'll cover the process of decomposing a camera matrix into intrinsic and extrinsic matrices, and we'll try to untangle the issues that can crop-up with different coordinate conventions.  In later articles, we'll study the parts of these matrices in more detail, and I'll cover how to convert them into a form usable by OpenGL.

<!--more-->

This is the second article in the series, "[The Perspective Camera, an Interactive Tour](/2012/08/13/introduction)."  To read other article in this series, head over to the [introduction page](/2012/08/13/introduction#toc).


Prologue: Getting a Camera Matrix
----------------------------------
Before we start, you might be asking "where does the camera matrix come from in the first place?"  It's a good question, because in most graphics applications, you'll be starting with the view and projection matrix already separated, and decomposition isn't necessary.  The "all-in-one" camera matrix usually arises when the parameters of a real camera are estimated from either a calibration process or from computer-vision techniques like structure-from-motion.  This article assumes you already have a camera matrix, but if you're looking for help with camera calibration, I recommend looking into the [Camera Calibration Toolbox for Matlab](http://www.vision.caltech.edu/bouguetj/calib_doc/).  OpenCV also seems to have [some useful routines](http://opencv.willowgarage.com/documentation/python/camera_calibration_and_3d_reconstruction.html) for automatic camera calibration from a sequences of chessboard images, although I haven't personally used them.  As usual, [Hartley and Zisserman's](http://www.robots.ox.ac.uk/~vgg/hzbook/) treatment of the topic is canonical.

<h2>Cut 'em Up: Camera Decomposition <a href="http://www.break.com/usercontent/2006/10/21/mitch-hedberg-on-pringles-169072" class="huh">[?]</a></h2>

To start, we'll assume your camera matrix is 3x4, which transforms homogeneous 3D world coordinates to homogeneous 2D image coordinates.  Following Hartley and Zisserman, we'll denote the matrix as *P*, and occasionally it will be useful to use the block-form:
 
<div>
\[ P = [M \,| -MC] \]
</div>

where *M* is an invertible 3x3 matrix, and *C* is a column-vector representing the camera's position in world coordinates.  Some calibration software provides a 4x4 matrix, which adds an extra row to preserve the *z*-coordinate.  In this case, ignoring the third row should give you the 3x4 matrix you want, but your mileage may vary.

The camera matrix by itself is useful when you want to project 3D points into a 2D image, but it has several drawbacks, including:
 
* It doesn't tell you where the camera is or where it's pointing.
* It doesn't tell you about the camera's internal geometry.
* Specular lighting isn't possible, since you can't get surface normals in camera coordinates.

To address these drawbacks, a camera matrix can be decomposed into the product of two matrices: an intrinsic matrix, *K*, and an extrinsic matrix, \\([R \, |\, -RC ]\\):

<div>\[P = K [R  \,| -RC ] \]</div>


The matrix *K* is a 3x3 upper-triangular matrix that describes the camera's internal parameters like focal length.  *R* is a 3x3 rotation matrix whose columns are the direction of the world axes in the camera's camera coordinate frame. The vector *C* is the camera center in world coordinates; the vector ***t** = -RC* gives the position of the world origin in camera coordinates.   We'll study each of these matrices in more detail in later articles, today we'll just discuss how to get them from *P*.

Recovering the camera center, *C*, is straightforward.  Note that the last column of *P* is *-MC*, so just right-multiply it by \\(-M&#94;{-1}\\).  (Hartley and Zisserman discuss two alternative approaches in section 6.2.4, which I assume are more numerically stable, but I haven't had any problems in my experience.  Any thoughts? Reply in the comments!)

<h2>Before You RQ-ze Me... <a href="http://www.youtube.com/watch?v=jQAvWte8w0c" class="huh">[?]</a></h2>

To recover R and K, we note that R is orthogonal by virtue of being a rotation matrix, and K is upper-triangular.  Those familiar with linear algebra will know that we can decompose any full-rank matrix into the product of an upper-triangular matrix and an orthogonal matrix by using [RQ-decomposition](http://en.wikipedia.org/wiki/QR_decomposition).  Unfortunately RQ-decomposition isn't available in many libraries including Matlab, but luckily, it's friend QR-decomposition usually is.  [Solem's vision blog](http://www.janeriksolem.net/2011/03/rq-factorization-of-camera-matrices.html) has a nice article implementing the missing function using a few matrix flips; here's a Matlab version (thanks to Solem for letting me repost this!):

{% highlight matlab %}
function [R Q] = rq(M)
    [Q,R] = qr(flipud(M)')
    R = flipud(R');
    R = fliplr(R);

    Q = Q';   
    Q = flipud(Q);
{% endhighlight %}
 Easy!

<h2> I'm seeing double...  FOUR decompositions!  <a href="http://imgur.com/1pAsu" class="huh">[?]</a></h2>

There's only one problem: the result of RQ-decomposition isn't unique.  To see this, try negating any column of *K* and the corresponding row of *R*: the resulting camera matrix is unchanged.  Most people simply force the diagonal elements of *K* to be positive, which is the correct approach if two conditions are true:

1. your image's X/Y axes point in the same direction as your camera's X/Y axes.
2. your camera looks in the positive-*z* direction.

Solem's blog elegantly gives us positive diagonal entries in three lines of code:

{% highlight matlab %}
# make diagonal of K positive
T = diag(sign(diag(K)));

K = K * T;
R = T * R; # (T is its own inverse)
{% endhighlight %}

   However, there are several practical situations in which the camera and image axes won't agree.  In this case the diagonal elements of *K* shouldn't be positive, and forcing them to be positive can result in side-effect that are nasty in practice, including:
    
   * The objects appear on the wrong side of the camera.
   * The rotation matrix has a determinant of -1 instead of 1.
   * Incorrect specular lighting.
   * Visible geometry won't render [due to a having negative *w* coordinate](http://stackoverflow.com/questions/2286529/why-does-sign-matter-in-opengl-projection-matrix).

<div class='context-img' style='width:321px'>
<img src='/img/hz_camera.png' />
<div class='caption'>Call me crazy, but I think Hartley and Zisserman's use weird coordinate conventions.  Camera and image <em>x</em>-axes point left... what's up with that?
<div class='credit'><a href="http://www.robots.ox.ac.uk/~vgg/hzbook/">From "Multiple View Geometry in Computer Vision"</a></div>
</div>
</div>
   In this case, you've got some fixing to do.  Start by making sure that your camera and world coordinates both have the same [handedness](http://en.wikipedia.org/wiki/Right-hand_rule).    Then take note of the axis conventions you used when you calibrated your camera.   What direction did the image *y*-axis point, up or down?  The *x*-axis?  Now consider your camera's coordinate axes.  Does your camera look down the negative-*z* axis (OpenGL-style)?  Positive-*z* (like Hartley and Zisserman)?  Does the *x*-axis point left or right?  The *y*-axis?  Okay, okay, you get the idea.
   
   With those in mind, the rules for getting signs right are pretty simple:

1. If the image *x*-axis and camera *x*-axis point in opposite directions, negate the first column of *K* and the first row of *R*.  
2. If the image *y*-axis and camera *y*-axis point in opposite directions, negate the second column of *K* and the second row of *R*.
3. If the camera looks down the **negative**-*z* axis, negate the third column of *K*.  *Leave R unchanged*.
4. If the determinant of *R* is -1, negate it.

The first two steps are self explanatory.  The last step is equivalent to multiplying the entire camera matrix, *P*, by -1.  Since *P* operates on homogeneous coordinates, multiplying it by any constant has no effect.  Lets examine the reasoning behind the third step...

<h2>Lookin' Out My Back Door <a href="http://www.youtube.com/watch?v=QNczeP33Yk0" class="huh">[?]</a></h2>

Although most mathematical treatments of projective geometry assume that the camera looks in the positive-*z* direction, many real-world systems (including OpenGL) place the camera looking down the negative-*z* axis.  This allows the *x* and *y* axis to point right and up, resulting in a coordinate system that feels natural while still being right-handed.

Recall that the conversion from 2D homogeneous coordinates to inhomogeneous involves dividing by the *z*-coordinate.  When an object in front of the camera has a negative-*z* coordinate, the 2D *x* and *y* coordinates are divided by a negative number, flipping their signs and causing points to be rendered in reverse.  To solve this, we could negate the camera *x* and *y*-coordinates before projecting, but it is equivalent to negate the camera *z*-coordinate instead.  You can accomplish this by negating the third column of *K* while keeping *R* unchanged.  Negating *z* also ensures that the w-coordinate is always positive for points in front of the camera, which OpenGL would clip otherwise.

Who Flipped my Axes?
-------------------------------------

Sometimes your camera will be calibrated using different coordinates than you prefer.  Converting between image coordinate conventions is accomplished by post-transforming the matrix by reflection and translation; you can roll these transformations into *K*.   

For example, suppose your original camera matrix produces traditional image coordinates, with the origin in the top-left and the *y*-axis pointing downward, but you prefer a center-origin with the *y-axis* pointing upward.   To convert, first negate the image *y*-coordinate, and then translate downward by *H/2*, where *H* is the image height in pixels.  The resulting intrinsic matrix *K'* is given by:    
<div>
\[
    K' = \begin{bmatrix}1 & 0 & 0 \\ 0 & 1 & -h/2 \\  0 & 0 & 1 \end{bmatrix} \times \begin{bmatrix}1 & 0 & 0 \\ 0 & -1 & 0 \\ 0 & 0 & 1 \end{bmatrix}  K
\] 
</div>

Summary
---------
The procedure above should give you a correct camera decomposition regardless of the coordinate conventions you use.  I've tested it in a handful of scenarios in my own research, and it has worked so far.  Of course, if you have any problems with this approach, I'm eager to hear about them, just leave a message in the comments, or [email me](/contact.html).

Tune-in next time, [when we investigate the extrinsic matrix](/2012/08/22/extrinsic), and we'll learn why, contrary to popular belief, it _doesn't_ represent the camera's pose.  Stay tuned!

