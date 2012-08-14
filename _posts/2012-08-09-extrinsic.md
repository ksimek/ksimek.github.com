---
layout: post
title: "The Camera Matrix, Part 2: The Extrinsic Matrix"
description: ""
published: false
---


Welcome to the third post in the series "[The Perspecive Camera - An Interactive Tour](/2012/08/13/introduction/)."  In the last post, [we learned how to decompose the camera matrix](/2012/08/02/decompose/) into a product of intrinsic and extrinic matrices.  In the next two posts, we'll explore the extrinsic and intrinsic matrices in greater detail.  

<h2>The Extrinsic Camera Matrix</h2>

The camera's extrinsic matrix describes the camera's location in the world, and what direction it's pointing.  Those familiar with OpenGL know this as the "View matrix" (or more loosely, the "Modelview matrix").  It has two components: a rotation matrix, *R*, and a translation vector ***t***, which, as we'll soon see, don't exactly correspond to the camera's rotation and translation.  First we'll examine the parts of the extrinsic matrix, and later we'll look at alternative ways of describing the camera's pose that are more intuitive.

The extrinsic matrix takes the form of a rigid transformation matrix: a 3x3 rotation matrix in the left-block, and 3x1 translation column-vector in the right:

<div>
\[ [ R | \boldsymbol{t}] = 
\left[ \begin{array}{ccc|c} 
r_{1,1} & r_{1,2} & r_{1,3} & t_1 \\
r_{2,1} & r_{2,2} & r_{2,3} & t_2 \\
r_{3,1} & r_{3,2} & r_{3,3} & t_3 \\
\end{array} \right] \]
</div>

We may further decompose this matrix into a rotation _followed by_ a translation:

<div>
\[ [ R | \boldsymbol{t}] = [\boldsymbol{I} | \boldsymbol{t}] \times [R | \boldsymbol{0}] = 
\left[ \begin{array}{ccc|c} 
1 & 0 & 0 & t_1 \\
0 & 1 & 0 & t_2 \\
0 & 0 & 1 & t_3 \\
\end{array} \right] \times
\left[ \begin{array}{ccc|c} 
r_{1,1} & r_{1,2} & r_{1,3} & 0  \\
r_{2,1} & r_{2,2} & r_{2,3} & 0 \\
r_{3,1} & r_{3,2} & r_{3,3} & 0 \\
\end{array} \right] 
 \]
</div>

This matrix describes how to transform points in world coordinates to camera coordinates.  The vector ***t*** can be interpreted as the position of the world origin in camera coordinates, and the columns of R represent represent the directions of the world-axes in camera coordinates.

The important thing to remember about the extrinsic matrix is that it describes how the _world_ is transformed relative to the _camera_.  This is often counter-intuitive, because we usually want to specify how the _camera_ is transformed relative to the _world_.    Next, we'll examine two alternative ways to describe the camera's extrinsic parameters that are more intuitive, and how to convert them into the form of an extrinsic matrix.

<h2>Building the Extrinsic Matrix from Camera Pose</h2> 
It's often more natural to specify the camera's pose directly rather than specifying how world points should transform to camera coordinates.  Luckilly, building an extrinsic camera matrix this way is easy: just build a rigid transformation matrix that describes the camera's pose and then take it's inverse.

Let *C* be a column vector describing the location of the camera-center in world coordinates, and let \\(R_c\\) be the rotation matrix describing the camera's orientation with respect to the world coordinate axes.  The transformation matrix that describes the camera's pose is then given by \\([R_c \| C ]\\).  We need to invert this matrix to get the extrinsic camera matrix, and in order to make this matrix invertible, we first make it square by adding an extra row of (0,0,0,1).  Then the extrinsic matrix is given by:

<div>
\begin{align}
\left[
\begin{array}{c|c}
R & \boldsymbol{t} \\
\hline 
\boldsymbol{0} & 1 \\
\end{array}
\right]
  &= 
\left[
\begin{array}{c|c}
R_c & C \\
\hline
\boldsymbol{0} & 1 \\
\end{array}
\right]^{-1} \\
  &= 
\left[

\left[
\begin{array}{c|c}
I & C \\
\hline
\boldsymbol{0} & 1 \\
\end{array}
\right]

\left[
\begin{array}{c|c}
R_c & 0 \\
\hline
\boldsymbol{0} & 1 \\
\end{array}
\right]
\right]^{-1} & \text{(decomposing rigid transform)} \\
&= 
\left[
\begin{array}{c|c}
R_c & 0 \\
\hline
\boldsymbol{0} & 1 \\
\end{array}
\right]^{-1} 
\left[
\begin{array}{c|c}
I & C \\
\hline
\boldsymbol{0} & 1 \\
\end{array}
\right]^{-1} & \text{(distributing the inverse)}\\
&= 
\left[
\begin{array}{c|c}
R_c^T & 0 \\
\hline
\boldsymbol{0} & 1 \\
\end{array}
\right]
\left[
\begin{array}{c|c}
I & -C \\
\hline
\boldsymbol{0} & 1 \\
\end{array}
\right] & \text{(applying the inverse)}\\
&= 
\left[
\begin{array}{c|c}
R_c^T & -R_c^TC \\
\hline
\boldsymbol{0} & 1 \\
\end{array}
\right] & \text{(matrix multiplication)}
\end{align} 
</div>

Thus, we see that the relationship between the extrinsic matrix parameters and the camera's pose is straightforward:

<div>
\[
\begin{align}
R  &= R_c^T \\
 \boldsymbol{t} &= -RC 
\end{align}
\]
</div>

<h3>The "Look-At" Camera</h3> 
Readers familiar with OpenGL might prefer a third way of specifying the camera's pose using *(a)* the camera's position, *(b)* what it's looking at, and *(c)* the "up" direction.  In legacy OpenGL, this is accomplished by the gluLookAt() function, so we'll call this the "look-at" camera.  Let *C* be the camera center, ***p*** be the target point, and ***u*** be up-direction.   The algorithm for computing the rotation matrix is (paraphrased from OpenGL documentation TODO-Link here):

1. Compute L = p - C.
2. Normalize L.
3. Compute s = L x u. (cross product)
4. Normalize s.
5. Compute u' = s x L.

The extrinsic matrix's rotation matrix is then given by:

<div>
\[
R = \left[ 
\begin{array}{ccc}
s_1 & u_1^' & -L_1 \\
s_2 & u_2^' & -L_2 \\
s_3 & u_3^' & -L_3 \\
\end{array}
\right]
\]
</div>

You can get the translation vector the same way as before, ***t** = -RC*.

<h2>Intrinsic Matrix</h2>
<p>
    The intrinsic parameters represent the camera's internal geometry.    Alternatively, they can be thought of as 2D transformations whereas extrinsic parameters affect 3D transformations.  As you change the intrinsic parameters, watch the left pane and notice that the camera (blue cube) doesn't move, only the viewing volume does.  Also note how the captured image in the right pane changes: the spheres can grow, move and distort, but their size, shape, and position relative to one-another is unchanged.  
</p>

{% include cam_demo.html %}

