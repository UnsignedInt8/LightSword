//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------

'use strict'

import * as os from 'os';
import * as cluster from 'cluster';
import { App } from './app';

type clusterOptions = {
  management: boolean,
  user: string,
  users: any[]
}

export function runAsClusterMode(options: clusterOptions, callback: () => void) {
  if (cluster.isMaster) {
    os.cpus().forEach(() => {
      cluster.fork();
    });
    
    cluster.on('exit', () => cluster.fork());
    return callback();
  }
  
  options.users.forEach(o => new App(o));
  
  if (options.management) require('./management/index');
  if (options.user) try { process.setuid(options.user) } catch(ex) { console.error(ex.message); }
}