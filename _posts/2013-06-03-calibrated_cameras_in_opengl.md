---
layout: post
title: "Calibrated Cameras in OpenGL without glFrustum"
description: ""
edit: "Author's note: some of this content appeared on my old blog as \"<a href=\"http://sightations.wordpress.com/2010/08/03/simulating-calibrated-cameras-in-opengl/\">Simulating Calibrated Cameras in OpenGL</a>\", which contained some errors and missing equations and suffered from general badness.  I hope you'll find this version to be less terrible.<br/><strong>Update</strong> (June 18, 2013):  added negative signs to definitions of C' and D'.<br /><strong>Update</strong> (August 19, 2013): James Gregson <a href=\"http://jamesgregson.blogspot.com/2011/11/matching-calibrated-cameras-with-opengl.html\">has posted an implementation in C++</a>.  I haven't tested it myself, but it looks quite nice."
latex_math: true
---
<div class="clearer"></div>
<div class='context-img' style='width:317px'>
<img src='/img/augmented_reality.jpg' />
<div class='caption'>Simulating a calibrated camera for augmented reality.
<div class='credit'><a href="http://www.flickr.com/photos/thp4/8060086636/">Credit: thp4</a></div>
</div>
</div>

You've calibrated your camera.  You've decomposed it into intrinsic and extrinsic camera matrices. Now you need to use it to render a synthetic scene in OpenGL.  You know the extrinsic matrix corresponds to the modelview matrix and the intrinsic is the projection matrix, but beyond that you're stumped.  You remember something about <code>gluPerspective</code>, but it only permits two degrees of freedom, and your intrinsic camera matrix has five.  glFrustum looks promising, but the mapping between its parameters and the camera matrix aren't obvious and it looks like you'll have to ignore your camera's axis skew.  You may be asking yourself, "I have a matrix, why can't I just use it?"

You can.  And you don't have to jettison your axis skew, either.  In this article, I'll show how to use your intrinsic camera matrix in OpenGL with minimal modification.  For illustration, I'll use OpenGL 2.1 API calls, but the same matrices can be sent to your shaders in modern OpenGL.

glFrustum:  Two Transforms in One
----------------------------------------------------


To better understand perspective projection in OpenGL, let's examine <code>glFrustum</code>. According to the OpenGL documentation,  
          
> glFrustum describes a perspective matrix that produces a perspective projection.

While this is true, it only tells half of the story. 

<!--more-->

In reality, <code>glFrustum</code> does two things: first it performs perspective projection, and then it converts to [normalized device coordinates (NDC)](http://medialab.di.unipi.it/web/IUM/Waterloo/node15.html).  The former is a common operation in projective geometry,  while the latter is OpenGL arcana, an implementation detail.  

To give us finer-grained control over these operations, we'll separate projection matrix into two matrices *Persp* and *NDC*:
    
<div>\[ Proj = NDC \times Persp \]</div>

Our intrinsic camera matrix describes a perspective projection, so it will be the key to the *Persp* matrix.  For the *NDC* matrix, we'll (ab)use OpenGL's <code>glOrtho</code> routine.

Step 1: Projective Transform
---------------------------

Our 3x3 intrinsic camera matrix *K* needs two modifications before it's ready to use in OpenGL.  First, for proper clipping, the (3,3) element of *K* _must_ be -1. OpenGL's camera looks down the *negative* z-axis, so if \\(K_{33}\\) is positive, vertices in front of the camera will have a negative *w* coordinate after projection.  In principle, this is okay, but [because of how OpenGL performs clipping](http://stackoverflow.com/questions/2286529/why-does-sign-matter-in-opengl-projection-matrix), all of these points will be clipped. 

If \\(K_{33}\\) isn't -1, your intrinsic and extrinsic matrices need some modifications.  Getting the camera decomposition right isn't trivial, so I'll refer the reader to [my earlier article on camera decomposition]({{site.baseurl}}/2012/08/14/decompose/), which will walk you through the steps.   Part of the result will be the negation of the third column of the intrinsic matrix, so you'll see those elements negated below.

<div>\[ K = \left( \begin{array}{ccc} \alpha & s & -x_0 \\ 0 & \beta & -y_0  \\ 0 & 0 & -1 \end{array} \right) \]</div>

For the second modification, we need to prevent losing Z-depth information, so we'll add an extra row and column to the intrinsic matrix.  

<div>\[ Persp = \left( \begin{array}{cccc} \alpha & s & -x_0 & 0 \\ 0 & \beta & -y_0 & 0 \\ 0 & 0 & A & B \\ 0 & 0 & -1 & 0 \end{array} \right)  \]</div>

where

<div> \[ \begin{align}
A &= near + far \\
B &= near * far
\end{align} \]
</div>

The new third row preserve the ordering of Z-values while mapping *-near* and *-far* onto themselves (after normalizing by *w*, proof left as an exercise).  The result is that points between the clipping planes remain between clipping planes after multiplication by *Persp*.

Step 2: Transform to NDC
--------------------------

The *NDC* matrix is (perhaps surprisingly) provided by <code>glOrtho</code>.  The *Persp* matrix converts a frustum-shaped space into a cuboid-shaped shape, while <code>glOrtho</code> converts the cuboid space to normalized device coordinates.  A call to <code>glOrtho(left, right, bottom, top, near, far)</code> constructs the matrix:
    
<div>\[ \text{glOrtho} = \left( \begin{array}{cccc} \frac{2}{right - left} & 0 & 0 & t_x \\ 0 & \frac{2}{top - bottom} & 0 & t_y \\ 0 & 0 & -\frac{2}{far - near} & t_z \\ 0 & 0 & 0 & 1 \end{array} \right) \]</div>

where

<div> \[ \begin{align}
t_x &= -\frac{right + left}{right - left} \\
t_y &= -\frac{top + bottom}{top - bottom} \\
t_z &= -\frac{far + near}{far - near} 
\end{align} \]
</div>

When calling <code>glOrtho</code>, the *near* and *far* parameters should be the same as those used to compute *A* and *B* above.  The choice of top, bottom, left, and right clipping planes correspond to the dimensions of the original image and the coordinate conventions used during calibration.  For example, if your camera was calibrated from an image with dimensions \\(W \times H\\) and its origin at the top-left, your OpenGL 2.1 code would be

    glLoadIdentity();
    glOrtho(0, W, H, 0, near, far);
    glMultMatrix(persp);

Note that *H* is used as the "bottom" parameter and *0* is the "top," indicating a y-downward axis convention.  

If you calibrated using a coordinate system with the y-axis pointing upward and the origin at the center of the image,

    glLoadIdentity();
    glOrtho(-W/2, W/2, -H/2, H/2, near, far);
    glMultMatrix(persp);

Note that there is a strong relationship between the <code>glOrtho</code> parameters and the perspective matrix.  For example, shifting the viewing volume left by X is equivalent to shifting the principal point right by X.  Doubling \\(\alpha\\) is equivalent to dividing *left* and *right* by two.  This is the same relationship that exists in a pinhole camera between the camera's geometry and the geometry of its film--shifting the pinhole right is equivalent to shifting the film left; doubling the focal length is equivalent to halving the dimensions of the film.  Clearly the two-matrix representation of projection is redundant, but keeping these matrices separate allows us to maintain the logical separation between the camera geometry and the image geometry. 

Equivalence to glFrustum
-------------------------

We can show that the two-matrix approach above reduces to a single call to <code>glFrustum</code> when \\(\alpha\\) and \\(\beta\\) are set to *near* and \\(s\\), \\(x_0\\) and \\(y_0\\) are zero.  The resulting matrix is:
        
<div>
\[ \begin{align}

Proj &= NDC * Persp \\[1.5em]
     &= 
        \left( \begin{array}{cccc} \frac{2}{right - left} & 0 & 0 & t_x \\ 0 & \frac{2}{top - bottom} & 0 & t_y \\ 0 & 0 & -\frac{2}{far - near} & t_z \\ 0 & 0 & 0 & 1 \end{array} \right)
        *
        \left( \begin{array}{cccc} near & 0 & 0 & 0 \\ 0 & near & 0 & 0 \\ 0 & 0 & A & B \\ 0 & 0 & -1 & 0 \end{array} \right) \\[1.5em]
    &= \left( \begin{array}{cccc} \frac{2 near}{right - left} & 0 & A' & 0 \\ 0 & \frac{2 near}{top - bottom} & B' & 0 \\ 0 & 0 & C' & D' \\ 0 & 0 & -1 & 0 \end{array} \right)
    \end{align} \]
</div>

where 

<div> \[ \begin{align}
A' &= \frac{right + left}{right - left} \\
B' &= \frac{top + bottom}{top - bottom} \\
C' &= -\frac{far + near}{far - near}  \\
D' &= -\frac{2 \; far \; near}{far - near}  \\
\end{align} \] </div>

This is equivalent to [the matrix produced by glFrustum](http://www.glprogramming.com/blue/ch05.html#id5478066).  

By tweaking the frame bounds we can relax the constraints imposed above.  We can implement focal lengths other than *near* by scaling the frame: 
    
<div> \[ \begin{align}
    left' &= \left( \frac{near}{\alpha} \right) left \\
    right' &= \left( \frac{near}{\alpha} \right) right \\
    top' &= \left( \frac{near}{\beta} \right) top \\
    bottom' &= \left( \frac{near}{\beta} \right) bottom
\end{align} \] </div>

Non-zero principal point offsets are achieved by shifting the frame window:

<div> \[ \begin{align}
    left'' &= left' - x_0 \\
    right'' &= right' - x_0 \\
    top'' &= top' - y_0 \\
    bottom'' &= bottom' - y_0
\end{align} \] </div>

Thus, with a little massaging, <code>glFrustum</code> can simulate a general intrinsic camera matrix with zero axis skew.

The Extrinsic Matrix
----------------------

The extrinsic matrix can be used as the modelview matrix without modification, just convert it to a 4x4 matrix by adding an extra row of *(0,0,0,1)*, and pass it to <code>glLoadMatrix</code> or send it to your shader.    If lighting or back-face culling are acting strangely, it's likely that your rotation matrix has a determinant of -1.  This results in the geometry rendering in the right place, but with normal-vectors reversed so your scene is inside-out.  The [previous article on camera decomposition]({{site.baseurl}}/2012/08/14/decompose/) should help you prevent this.

Alternatively, you can convert your rotation matrix to axis-angle form and use <code>glRotate</code>.  Remember that the fourth column of the extrinsic matrix is the translation *after* rotating, so your call to <code>glTranslate</code> should come *before* <code>glRotate</code>.  Check out [this previous article]({{site.baseurl}}/2012/08/22/extrinsic/) for a longer discussion of the extrinsic matrix, including how to it with <code>glLookAt</code>.


Conclusion
---------------

We've seen two different ways to simulate a calibrated camera in OpenGL, one using glFrustum and one using the intrinsic camera matrix directly.    If you need to implement radial distortion, it should be possible with a vertex shader, but you'll probably want a high poly count so the curved distortions appear smooth--does anyone have experience with this?  In a future article, I'll cover how to accomplish stereo and head-tracked rendering using simple modifications to your intrinsic camera parameters.  

