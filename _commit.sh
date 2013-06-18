#!/bin/bash
 git checkout source
 git add -A
 if [[ $# == 0 ]]; then
     git commit
 else
     git commit -m "$1";
 fi
 git push origin source
