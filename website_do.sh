#!/bin/bash

rm -fr /evading
cd /
git clone git@github.com:supahero1/evading
cd evading
make sed WEBSITE_NAME=evading.shadam.xyz SERVER_NAME=frankfurt.shadam.xyz SECUR>
cd website
npm i express
npm i ws
make
cd /