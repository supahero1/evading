#!/bin/bash

rm -fr /evading
cd /
git clone git@github.com:supahero1/evading
cd evading
make sed WEBSITE_NAME=evading.shadam.xyz SERVER_NAME=frankfurt.shadam.xyz SECURE_WEBSITE=1 SECURE_SERVER=1
cd website
npm i express
npm i ws
make
cd /