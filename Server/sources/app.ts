//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

require('kinq').enable();
require('async-node');
import * as fs from 'fs';
import { Server } from './socks5/server'

export class App {
  constructor(options?: any) {
    let defaultOptions = {
      cipherAlgorithm: 'aes-256-cfb',
      password: 'lightsword.neko',
      port: 23333,
      plugin: 'lightsword'
    }
    
    options = options || defaultOptions;
    Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] || defaultOptions[n]);
    
    new Server(options).start();
    
    process.on('uncaughtException', (err) => fs.writeFileSync('~/lightsword.dump', err.toString()));
  }
}

if (!module.parent) {
  process.title = 'LightSword Server Debug Mode';
  new App();
}