#!/bin/bash

cd __DIR_TOP__/server
for((;;))
do
  node main.js
  echo "Restarting in 1 second"
  sleep 1
done