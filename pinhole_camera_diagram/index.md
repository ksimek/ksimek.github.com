---
layout: page
title: "Pinhole Camera Diagram"
description: ""
---
{% include JB/setup %}

<div class='context-img' style='width:272px'>
<img src='{{site.baseurl}}/img/intrinsic-pinhole-camera.png' />
</div>

When writing an article on [the intrinsic camera matrix]({{site.baseurl}}/2013/08/13/intrinsic/), I created a diagram to illustrate various properties of the pinhole camera.  I've made the Adobe Illustrator source file available under a [creative commons license](http://creativecommons.org/licenses/by-nc-sa/3.0/).  My hope is that others can use this for instructional purposes and hopefully improve upon it.  Feel free to modify it to your needs, and if you use it in your project, [I'd love to hear about it]({{site.baseurl}}/contact.html).
 
[Download it here](https://github.com/ksimek/ksimek.github.com/blob/source/resources/intrinsic.ai)
-----
<br />

Details
============
The file is split into several layers, which include

* Pinhole camera w/ labels
* Principal axis / Principal point
* Principal point offset
* Focal Length
* 3D scene 
* Scene image on film
* Scene image on virtual image plane 

You can use the "saved views" feature in Illustrator to see some example configurations, which you can see below.  
    

![pinhole camera]({{site.baseurl}}/img/intrinsic-pinhole-camera.png)
Basic pinhole camera.

![focal length]({{site.baseurl}}/img/intrinsic-focal-length.png)
Focal length

![Principal point and principal axis]({{site.baseurl}}/img/intrinsic-pp.png)
Principal point and axis

![Principal point offset]({{site.baseurl}}/img/intrinsic-pp-offset.png)
Principal point offset

![Principal point offset, pinhole shifted right]({{site.baseurl}}/img/intrinsic-pp-offset-delta-alt.png)
Principal point offset, shifted pinhole

![Principal point offset, film shifted left]({{site.baseurl}}/img/intrinsic-pp-offset-delta.png)
Principal point offset, shifted film

![frustum]({{site.baseurl}}/img/intrinsic-frustum.png)
Pinhole camera with frustum

![frustum without camera box]({{site.baseurl}}/img/intrinsic-frustum-no-box.png)
Frustum only, with true image plane

![frustum representation, final ]({{site.baseurl}}/img/intrinsic-frustum-final.png)
Frustum only, virtual image plane only.

<div class="post-sharing">
 {% include JB/sharing %}
</div>

{% include JB/comments %}
