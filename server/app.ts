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
    server.once('close', () => App.Users.delete(options.port));
    
    App.Users.set(options.port, server);
  }
  
  public static Users = new Map<number, LsServer>();
  
  public static addUser(port: number, cipherAlgorithm: string, password: string) {
    port = port || Number(Math.min(10000, Math.random() * 50000 + 10000).toFixed());
    cipherAlgorithm = cipherAlgorithm || defaultCipherAlgorithm;
    password = password || defaultPassword;
    
    let option = {
      cipherAlgorithm,
      password,
      port,
      timeout: 10
    };
    
    new App(option)
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