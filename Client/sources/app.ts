//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

require('kinq').enable();
require('async-node');

import { LocalServer } from './socks5/localServer';
import { Socks5Connect } from './socks5/connect';
import { IDispatchReceiver, defaultQueue as DefaultDispatchQueue } from './lib/dispatchQueue';
import * as consts from './socks5/consts';

export class App implements IDispatchReceiver {
  constructor(options?) {
    let defaultOptions = {
      addr: 'localhost',
      port: 1080,
      serverAddr: 'localhost',
      serverPort: 23333,
      cipherAlgorithm: 'aes-256-cfb',
      password: 'lightsword',
      socks5Username: '',
      socks5Password: '',
      timeout: 60
    };
    
    if (options) Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] || defaultOptions[n]);
    DefaultDispatchQueue.register(consts.REQUEST_CMD.CONNECT.toString(), this);
      
    let server = new LocalServer(options || defaultOptions);
    server.start();
  }
  
  receive(msg: string, args: any) {
    new Socks5Connect(args);
  }
}

if (!module.parent) {
  new App();
}
