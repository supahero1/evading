#!/bin/bash

rm -fr /evading
cd /
git clone git@github.com:supahero1/evading
cd evading
make sed WEBSITE_NAME=evading.shadam.xyz SERVER_NAME=frankfurt.shadam.xyz SECUR>
cd server
npm i express ws
npm install --save-optional bufferutil
npm install --save-optional utf-8-validate
make
cd /