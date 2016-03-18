#!/bin/bash

apt-get update -y
apt-get install curl -y
curl -sL https://deb.nodesource.com/setup_5.x | bash -
apt-get install -y nodejs
npm install lightsword -g