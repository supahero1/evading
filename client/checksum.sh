#!/bin/bash

echo "$(cat style.min.css | openssl sha256)" > style.checksum.txt
echo "$(cat main.min2.js | openssl sha256)" > main.checksum.txt
