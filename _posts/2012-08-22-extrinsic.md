---
layout: post
title: "Dissecting the Camera Matrix, Part 2: The Extrinsic Matrix"
description: ""
---


Welcome to the third post in the series "[The Perspecive Camera - An Interactive Tour](/2012/08/13/introduction/)."  In the last post, [we learned how to decompose the camera matrix](/2012/08/14/decompose/) into a product of intrinsic and extrinsic matrices.  In the next two posts, we'll explore the extrinsic and intrinsic matrices in greater detail.  First we'll explore various ways of looking at the extrinsic matrix, with an interactive demo at the end.

The Extrinsic Camera Matrix
--------------------------------

The camera's extrinsic matrix describes the camera's location in the world, and what direction it's pointing.  Those familiar with OpenGL know this as the "view matrix" (or rolled into the "modelview matrix").  It has two components: a rotation matrix, *R*, and a translation vector ***t***, but, as we'll soon see, these don't exactly correspond to the camera's rotation and translation.  First we'll examine the parts of the extrinsic matrix, and later we'll look at alternative ways of describing the camera's pose that are more intuitive.

<!--more-->

The extrinsic matrix takes the form of a rigid transformation matrix: a 3x3 rotation matrix in the left-block, and 3x1 translation column-vector in the right:

<div>
\[ [ R \, |\, \boldsymbol{t}] = 
\left[ \begin{array}{ccc|c} 
r_{1,1} & r_{1,2} & r_{1,3} & t_1 \\
r_{2,1} & r_{2,2} & r_{2,3} & t_2 \\
r_{3,1} & r_{3,2} & r_{3,3} & t_3 \\
\end{array} \right] \]
</div>

It's common to see a version of this matrix with extra row of (0,0,0,1) added to the bottom.  This makes the matrix square, which allows us to further decompose this matrix into a rotation _followed by_ translation:

<div>
\[ 
\begin{align}
    \left [
        \begin{array}{c|c} 
            R & \boldsymbol{t} \\
            \hline
            \boldsymbol{0} & 1 
        \end{array}
    \right ] &= 
    \left [
        \begin{array}{c|c} 
            I & \boldsymbol{t} \\
            \hline
            \boldsymbol{0} & 1 
        \end{array}
    \right ] 
    \times
    \left [
        \begin{array}{c|c} 
            R & \boldsymbol{0} \\
            \hline
            \boldsymbol{0} & 1 
        \end{array}
    \right ] \\
        &=
\left[ \begin{array}{ccc|c} 
1 & 0 & 0 & t_1 \\
0 & 1 & 0 & t_2 \\
0 & 0 & 1 & t_3 \\
  \hline
0 & 0 & 0 & 1
\end{array} \right] \times
\left[ \begin{array}{ccc|c} 
r_{1,1} & r_{1,2} & r_{1,3} & 0  \\
r_{2,1} & r_{2,2} & r_{2,3} & 0 \\
r_{3,1} & r_{3,2} & r_{3,3} & 0 \\
  \hline
0 & 0 & 0 & 1
\end{array} \right] 
\end{align}
 \]
</div>

This matrix describes how to transform points in world coordinates to camera coordinates.  The vector ***t*** can be interpreted as the position of the world origin in camera coordinates, and the columns of *R* represent represent the directions of the world-axes in camera coordinates.

The important thing to remember about the extrinsic matrix is that it describes how the _world_ is transformed relative to the _camera_.  This is often counter-intuitive, because we usually want to specify how the _camera_ is transformed relative to the _world_.    Next, we'll examine two alternative ways to describe the camera's extrinsic parameters that are more intuitive, and how to convert them into the form of an extrinsic matrix.

Building the Extrinsic Matrix from Camera Pose
------------------------------------------------------

It's often more natural to specify the camera's pose directly rather than specifying how world points should transform to camera coordinates.  Luckily, building an extrinsic camera matrix this way is easy: just build a rigid transformation matrix that describes the camera's pose and then take it's inverse.

Let *C* be a column vector describing the location of the camera-center in world coordinates, and let \\(R_c\\) be the rotation matrix describing the camera's orientation with respect to the world coordinate axes.  The transformation matrix that describes the camera's pose is then given by \\([R_c \,|\, C ]\\).  Like before, we make the matrix square by adding an extra row of (0,0,0,1).  Then the extrinsic matrix is given by inverting the camera's pose matrix:

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

When applying the inverse, we use the fact that the inverse of a rotation matrix is it's transpose, and inverting a translation matrix simply negates the translation vector.  Thus, we see that the relationship between the extrinsic matrix parameters and the camera's pose is straightforward:

<div>
\[
\begin{align}
R  &= R_c^T \\
 \boldsymbol{t} &= -RC 
\end{align}
\]
</div>

Some texts write the extrinsic matrix substituting *-RC* for ***t***, which mixes a world transform (*R*) and camera transform notation (*C*). 



The "Look-At" Camera
-----------------------------

Readers familiar with OpenGL might prefer a third way of specifying the camera's pose using *(a)* the camera's position, *(b)* what it's looking at, and *(c)* the "up" direction.  In legacy OpenGL, this is accomplished by the gluLookAt() function, so we'll call this the "look-at" camera.  Let *C* be the camera center, ***p*** be the target point, and ***u*** be up-direction.   The algorithm for computing the rotation matrix is (paraphrased from the [OpenGL documentation](http://pic.dhe.ibm.com/infocenter/aix/v6r1/index.jsp?topic=%2Fcom.ibm.aix.opengl%2Fdoc%2Fopenglrf%2FgluLookAt.htm)):

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

Try it out!
------------

Below is an interactive demonstration of the three different ways of parameterizing a camera's extrinsic parameters.  Note how the camera moves differently as you switch between the three parameterizations.  

This requires a WebGL-enabled browser with Javascript enabled.

{% include cam_demo.html %}

Conclusion
---------
We've just studied three different ways of parameterizing a camera's extrinsic state.  Which parameterization you prefer to use will depend on your application.  If you're writing a Wolfenstein-style FPS, you might like the world-centric parameterization, because moving along \(t_z\) always corresponds to walking forward.  Or you might be interpolating a camera through waypoints in your scene, in which case, the camera-centric parameterization is preferred, since you can specify the position of your camera directly.  If you aren't sure which you prefer, play with the tool above and decide which approach feels the most natural.

Join us next time when we explore the intrinsic matrix, and we'll learn why hidden parts of your scene can never be revealed by zooming your camera.  See you then!

<br />
