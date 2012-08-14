#!/bin/bash
## Do this before publishing:
# git checkout source
# git add -A
# git commit
# git push origin source

# Push master branch
sed -i -e 's/production:.*/production: true/g' _config.yml
mkdir -p /tmp/site
rm -rf /tmp/site/* 
jekyll --pygments /tmp/site \
&& git checkout master \
&& rm -r * \
&& cp -r /tmp/site/* . \
&& rm -r /tmp/site/ \
&& git add -A \
&& git commit \
&& git push origin master \
&& git checkout source \
&& git checkout .
sed -i -e 's/production:.*/production: false/g' _config.yml
