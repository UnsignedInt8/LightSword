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
import * as logger from 'winston';
import { IpHelper } from './lib/ipHelper';
import { PluginPivot } from './plugins/main';

export class App implements IDispatchReceiver {
  pluginPivot: PluginPivot;
  localPlugin: PluginPivot = null;
  bypassLocal: boolean;
  isLocalProxy: boolean;
  msgMapper: Map<consts.REQUEST_CMD, any>;
  
  constructor(options?) {
    let defaultOptions = {
      addr: 'localhost',
      port: 1080,
      serverAddr: 'localhost',
      serverPort: 23333,
      cipherAlgorithm: 'aes-256-cfb',
      password: 'lightsword.neko',
      socks5Username: '',
      socks5Password: '',
      plugin: 'lightsword',
      timeout: 60
    };
    
    options = options || defaultOptions;
    Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] || defaultOptions[n]);
    this.bypassLocal = options.bypassLocal === undefined ? true : options.bypassLocal;
    
    let isLocalProxy = this.isLocalProxy = ['localhost', '127.0.0.1', '', undefined, null].contains(options.serverAddr.toLowerCase());
    if (isLocalProxy) options.plugin = 'local';
    this.pluginPivot = new PluginPivot(options.plugin);

    DefaultDispatchQueue.register(consts.REQUEST_CMD.CONNECT, this);
    
    new LocalServer(options).start();
  }
  
  receive(msg: any, args: any) {
    
    let isLocalProxy = this.isLocalProxy;
    let plugin = this.pluginPivot;
    
    // If dstAddr is local area address, bypass it.
    if (IpHelper.isLocalAddress(args.dstAddr) && this.bypassLocal && !this.isLocalProxy) {
      if (!this.localPlugin) this.localPlugin = new PluginPivot('local');
      plugin = this.localPlugin;
      isLocalProxy = true;
    }
    
    if (isLocalProxy) {
      args.serverAddr = args.dstAddr;
      args.serverPort = args.dstPort;
    }
    
    new Socks5Connect(plugin, msg, args);
  }
}

if (!module.parent) {
  process.title = 'LightSword Client Debug Mode';
  new App({ serverAddr: '::1', port: 2002, });
}
