#!/bin/bash

cd /evading/website
for((;;))
do
  node main.js
  echo "Restarting in 1 second"
  sleep 1
done