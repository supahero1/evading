#!/bin/bash

cd /home/franek/c/evading/server
for((;;))
do
  ./main
  echo "Restarting in 1 second"
  sleep 1
done