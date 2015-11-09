'use strict'

//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

require('kinq')();
const Socks5Server = require('./core/socks5Server');

module.exports = function(options) {
  
  const defaultOptions = {
    addr: 'localhost',
    port: 1080,
    lsAddr: 'localhost',
    lsPort: 23333,
    cipherAlgorithm: 'aes-256-cfb',
    password: 'lightsword',
    timeout: 60
  };
  
  Object.getOwnPropertyNames(defaultOptions)
    .forEach(n => options[n] = options[n] ? options[n] : defaultOptions[n]);
  
  if (!options.lsPort || !options.lsAddr) {
    console.error('Invalid arguments: server address, server port')
    process.exit(1);
  }
  
  let server = new Socks5Server(options);
  server.start();
  
  process.title = 'LightSword-Socks5 Proxy Server';   
}
