#!/bin/bash

cd /evading/website
apt install npm nodejs net-tools
ufw enable
ufw allow 443
npm i express
npm i -g google-closure-compiler
