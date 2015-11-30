//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

require('../lib/socketEx');
require('kinq').enable();
require('async-node');
import { ServerOptions } from './socks5/socks5Server';
import { LocalProxyServer } from './socks5/localProxyServer';
import { RemoteProxyServer } from './socks5/remoteProxyServer';

let localAddrs = ['127.0.0.1', 'localhost', undefined, null];

export class App {
  
  constructor(options) {
    let defaultOptions: ServerOptions = {
      listenAddr: 'localhost',
      listenPort: 1080,
      serverAddr: 'localhost',
      serverPort: 2015,
      cipherAlgorithm: 'aes-256-cfb',
      password: 'lightsword.neko',
      timeout: 60,
      bypassLocal: true
    };
    
    options = options || defaultOptions;
    Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] || defaultOptions[n]);
    
    let isLocalProxy = localAddrs.contains(options.serverAddr);
    let server = isLocalProxy ? new LocalProxyServer(options) : new RemoteProxyServer(options);
    server.start();
  }
}

if (!module.parent) {
  process.title = 'LightSword Client Debug Mode';
  new App({ serverAddr: '::1', listenPort: 2002 });
} else {
  localAddrs.push('::1');
}