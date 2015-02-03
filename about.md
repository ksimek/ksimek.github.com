---
layout: page
title: "About Me"
description: ""
---
{% include JB/setup %}

<div class='context-img' style='width:184px'>
<img src='/img/portrait.jpg' />
</div>
I'm Kyle Simek, a research assistant in computer vision at the University of Arizona.  My research centers around applying Bayesian reasoning to various computer vision problems.  I've worked on multiple target tracking in 3D, camera calibration, 3D reconstruction, virtual reality, and 3D graphics.  I'm currently developing a Gaussian process model for recovering structure and nonrigid motion in images of plants.     

I'm the co-author of Ergo, a C++ template library for Markov Chain Monte Carlo simulation and the author of cudcvt, a computer vision toolkit in CUDA.  You can see more of my work at the [code page](/code.html).

{% if site.enable_hiring %}
{% include hire_about  %}
{% endif %}
