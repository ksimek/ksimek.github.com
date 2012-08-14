#!/bin/bash
## Do this before publishing:
# git checkout source
# git add -A
# git commit
# git push origin source

# Push master branch
jekyll --pygments \
&& git checkout master \
&& git rm -r * >/dev/null \
&& cp -r _site/* . \
&& rm -r _site \
&& git add -A \
&& git commit \
&& git push origin master
