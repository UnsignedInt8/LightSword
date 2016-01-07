//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

require('async-node');
require('kinq').enable();
require('../lib/socketEx');
import { LsServer, ServerOptions } from './server';
import { defaultCipherAlgorithm, defaultServerPort, defaultPassword } from '../lib/constant';

export class App {
  
  constructor(options?) {
    let defaultOptions = {
      cipherAlgorithm: defaultCipherAlgorithm,
      password: defaultPassword,
      port: defaultServerPort,
      timeout: 10,
      expireTime: undefined,
      disableSelfProtection: false
    };
    
    options = options || defaultOptions;
    Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] || defaultOptions[n]);
    
    let server = new LsServer(options);
    server.start();
    server.once('close', () => App.Users.delete(options.port));
    
    App.Users.set(options.port, server);
  }
  
  public static Users = new Map<number, LsServer>();
  
  public static addUser(options: ServerOptions): Boolean {
    if (App.Users.has(options.port)) return false;
    
    new App(options);
    return true;
  }
  
  public static removeUser(port) {
    if (!App.Users.has(port)) return;
    
    let server = App.Users.get(port);
    server.stop();
  }
}

if (!module.parent) {
  process.title = 'LightSword Server Debug Mode';
  new App();
}