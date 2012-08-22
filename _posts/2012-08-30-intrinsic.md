---
layout: post
title: "The Camera Matrix, Part 3: The Intrinsic Matrix"
description: ""
published: false
---
<h2>Intrinsic Matrix</h2>
<p>
    The intrinsic parameters represent the camera's internal geometry.    Alternatively, they can be thought of as 2D transformations whereas extrinsic parameters affect 3D transformations.  As you change the intrinsic parameters, watch the left pane and notice that the camera (blue cube) doesn't move, only the viewing volume does.  Also note how the captured image in the right pane changes: the spheres can grow, move and distort, but their size, shape, and position relative to one-another is unchanged.  
</p>

The translation vector, ***t***, is sometimes written as *-RC*, where *C* is terms the camera's center in world coordinates.  
