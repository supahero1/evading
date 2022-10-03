#!/bin/bash

rm -fr /evading
cd /
git clone git@github.com:supahero1/evading
cd evading
make sed WEBSITE_NAME=__WEBSITE_NAME__ SERVER_NAME=__SERVER_NAME__ SECURE_WEBSITE=__SECURE_WEBSITE__ SECURE_SERVER=__SECURE_SERVER__
cd server
make
