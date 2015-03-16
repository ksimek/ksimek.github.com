---
layout: post
title: "Compiling ELSD (Ellipse and Line Segment Detector) on OS X"
description: ""
category: 
tags: []
---
{% include JB/setup %}

<div class="clearer"></div>
<div class='context-img' style='width:317px'>
<img src='{{site.baseurl}}/img/elsd_before_small.jpg' width="317" />
<div class='caption'>Input image
</div>
<br />

<img src='{{site.baseurl}}/img/elsd_after_small.png' width="317" />
<div class='caption'>ELSD results
</div>
</div>

[ELSD is a new program](http://ubee.enseeiht.fr/vision/ELSD/) for detecting line segments and elliptical curves in images.  It gives [very impressive results]({{site.baseurl}}/misc/elsd_results.html) by using a novel model selection criterion to distinguish noise curves from foreground, as detailed in the author's [ECCV 2012 paper](http://ubee.enseeiht.fr/vision/ELSD/eccv2012-ID576.pdf).  Most impressive, it works out of the box **with no parameter tuning.**


The authors have generously released their code under [Affero GPL](http://www.gnu.org/licenses/why-affero-gpl.html), but it requires a few tweaks to compile on OSX.  

First, in `process_curve.c`, replace this line:
    
    #include <clapack.h>

with this:
    
    #ifdef __APPLE__
    #include <Accelerate/Accelerate.h>
    #else
    #include <clapack.h>
    #endif

Second, in `makefile`, change this line

    cc -o elsd elsd.c valid_curve.c process_curve.c process_line.c write_svg.c -llapack_LINUX -lblas_LINUX -llibf2c -lm

to this:
    
    cc -o elsd -framework accelerate  elsd.c valid_curve.c process_curve.c process_line.c write_svg.c -lf2c -lm 

Thanks to authors Viorica Pătrăucean, Pierre Gurdjos, and Rafael Grompone von Gioi for sharing this valuable new tool!

**Update**: I've written a python script to convert ELSD's output into polylines, check out the [code page]({{site.baseurl}}/code.html)
