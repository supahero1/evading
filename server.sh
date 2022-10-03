#!/bin/bash

rm -fr /evading
cd /
git clone git@github.com:supahero1/evading
cd evading
make sed WEBSITE_NAME=localhost SERVER_NAME=localhost SECURE_WEBSITE=0 SECURE_SERVER=0
cd server
make
