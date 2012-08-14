#!/bin/bash
## Do this before publishing:
# git checkout source
# git add -A
# git commit
# git push origin source

# Push master branch
mkdir -p /tmp/site
rm -rf /tmp/site/* 
jekyll --pygments /tmp/site \
&& git checkout master \
&& rm -r * \
&& cp -r /tmp/site/*. \
&& rm -r /tmp/site/ \
&& git add -A \
&& git commit \
&& git push origin master
