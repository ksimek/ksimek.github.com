#!/bin/bash
## Do this before publishing:
# git checkout source
# git add -A
# git commit
# git push origin source

# Push master branch
sed -i '' -e 's/production:.*/production: true/g' _config.yml
mkdir -p /tmp/cv_site
rm -rf /tmp/cv_site/* 
jekyll build -d /tmp/cv_site --config _config.yml,_config_prod.yml \
&& git checkout master \
&& rm -r * \
&& cp -r /tmp/cv_site/* . \
&& rm -r /tmp/cv_site/ \
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
