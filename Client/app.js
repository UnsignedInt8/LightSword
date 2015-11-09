'use strict'

//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

require('kinq')();
const Socks5Server = require('./core/socks5Server');

let options = {
  addr: 'localhost',
  port: 2002,
  lsAddr: 'localhost',
  lsPort: 23333,
  cipherAlgorithm: 'aes-256-cfb',
  password: 'lightsword',
  timeout: 60
};

let server = new Socks5Server(options);
server.start();

process.title = 'LightSword-Socks5 Proxy Server';

module.exports = server;
