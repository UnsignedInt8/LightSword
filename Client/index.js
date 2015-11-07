//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const cluster = require('cluster');
const os = require('os');
const numCpus = os.cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCpus; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (work) => {
    cluster.fork();
  })
} else {
  require('./app');
}