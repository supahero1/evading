#!/bin/bash

cd /evading/server
apt install npm nodejs net-tools
npm i yarn -g
yarn add uWebSockets.js@uNetworking/uWebSockets.js\#v20.10.0
iptables -A INPUT -p tcp --syn --dport 443 -m connlimit --connlimit-above 1 --connlimit-mask 32 -j REJECT --reject-with tcp-reset
 