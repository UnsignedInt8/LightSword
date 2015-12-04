//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as os from 'os';
import * as cluster from 'cluster';
import { App } from './app';

export function runAsClusterMode(options: any[]) {
  if (cluster.isMaster) {
    os.cpus().forEach(() => {
      cluster.fork();
    });
    
    cluster.on('exit', () => cluster.fork());
    return;
  } 
  
  options.forEach(o => new App(o));
}