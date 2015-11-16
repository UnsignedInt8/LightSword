//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

require('kinq').enable();
require('async-node');

import { LocalServer } from './socks5/localServer';
import { Socks5Connect } from './socks5/connect';
import { IDispatchReceiver, defaultQueue as DefaultDispatchQueue } from './lib/dispatchQueue';
import { IPluginGenerator } from './socks5/interfaces';
import * as consts from './socks5/consts';

export class App implements IDispatchReceiver {
  connectPlugin: IPluginGenerator;
  isLocalProxy: boolean;
  msgMapper: Map<consts.REQUEST_CMD, any>;
  
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
    
    if (options) 
      Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] || defaultOptions[n]);
    else
      options = defaultOptions;
    
    let isLocalProxy = this.isLocalProxy = ['localhost', '', undefined, null].contains(options.serverAddr.toLowerCase());
    let pluginPath = `./plugins/connect/${isLocalProxy ? 'local' : 'main'}`;
    this.connectPlugin = require(pluginPath);
    
    let msgMapper = new Map();
    msgMapper.set(consts.REQUEST_CMD.CONNECT, [this.connectPlugin, Socks5Connect]);
    this.msgMapper = msgMapper;
    
    DefaultDispatchQueue.register(consts.REQUEST_CMD.CONNECT, this);
    let server = new LocalServer(options || defaultOptions);
    server.start();
  }
  
  receive(msg: any, args: any) {
    let tuple = this.msgMapper.get(msg);
    if (!tuple) return;
    
    let executor = tuple[1];
    new executor(tuple[0], args, this.isLocalProxy);
  }
}

if (!module.parent) {
  process.title = 'LightSword Client Debug';
  new App();
}
