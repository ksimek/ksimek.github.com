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
jekyll build -d /tmp/site --config _config.yml,_config_prod.yml \
&& git checkout master \
&& rm -r * \
&& cp -r /tmp/site/* . \
&& rm -r /tmp/site/ \
&& git add -A 

if [[ $? -ne 0 ]]; then
    exit;
fi

if [[ $# == 0 ]]; then
    git commit 
else
     git commit -m "$1";
fi

if [[ $? -ne 0 ]]; then
    exit;
fi

git push origin master \
&& git checkout source \
&& git checkout .
