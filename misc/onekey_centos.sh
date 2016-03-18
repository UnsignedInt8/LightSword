#!/bin/bash

yum update -y
yum install curl -y
curl -sL https://rpm.nodesource.com/setup_5.x | bash -
yum install -y nodejs
npm install lightsword -g