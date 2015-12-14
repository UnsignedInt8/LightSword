//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

require('../lib/socketEx');
require('kinq').enable();
require('async-node');
import { defaultServerPort, defaultCipherAlgorithm } from '../lib/constant';
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
      serverPort: defaultServerPort,
      cipherAlgorithm: defaultCipherAlgorithm,
      password: 'lightsword.neko',
      timeout: 60,
      bypassLocal: true
    };
    
    options = options || defaultOptions;
    Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] === undefined ? defaultOptions[n] : options[n]);
    
    let isLocalProxy = localAddrs.contains(options.serverAddr);
    let server = isLocalProxy ? new LocalProxyServer(options) : new RemoteProxyServer(options);
    server.start();
  }
}

if (!module.parent) {
  process.title = 'LightSword Client Debug Mode';
  new App({ serverAddr: '::1', listenPort: 2002, bypassLocal: false });
} else {
  localAddrs.push('::1');
}