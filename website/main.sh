#!/bin/bash

cd /home/franek/c/evading/website
for((;;))
do
  node main.js
  echo "Restarting in 1 second"
  sleep 1
done