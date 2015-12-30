//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

require('async-node');
require('kinq').enable();
require('../lib/socketEx');
import { LsServer } from './server';
import { defaultCipherAlgorithm, defaultServerPort, defaultPassword } from '../lib/constant';

export class App {
  
  constructor(options?) {
    let defaultOptions = {
      cipherAlgorithm: defaultCipherAlgorithm,
      password: defaultPassword,
      port: defaultServerPort,
      timeout: 60
    };
    
    options = options || defaultOptions;
    Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] || defaultOptions[n]);
    
    let server = new LsServer(options);
    server.start();
  }
  
  
}

if (!module.parent) {
  process.title = 'LightSword Server Debug Mode';
  new App();
}