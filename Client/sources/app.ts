//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

require('kinq').enable();
require('async-node');

import { LocalServer } from './socks5/localServer';

let App = function(options?) {
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
  
  let server = new LocalServer(options || defaultOptions);
  server.start();  
}

if (!module.parent) {
  App();
}

module.exports = App;
