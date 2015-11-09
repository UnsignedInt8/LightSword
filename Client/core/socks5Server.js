'use strict'

//----------------------------- 
// Copyright 2015 SunshinyNeko Written by VSCode
//----------------------------- 

// https://www.ietf.org/rfc/rfc1928.txt

require('kinq')();
const net = require('net');
const logger = require('winston');
const handleRequest = require('./socks5Proxy');

class Socks5Server {
  
  constructor(options) {
    Object.assign(this, options);
    this._options = options;
  }
  
  start() {

    let server = net.createServer((socket) => {
      let proxyOptions = this._options;
      handleRequest(socket, proxyOptions);
    });
    
    server.listen(this.port, this.addr);
    
    server.on('error', (err) => {
      logger.error(err.code);
      process.exit(1);
    })
    
    this._server = server;
  }
  
  stop() {
    this._server.close();
  }
}

module.exports = Socks5Server;