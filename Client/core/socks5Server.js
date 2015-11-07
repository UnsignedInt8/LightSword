'use strict'

//----------------------------- 
// Copyright 2015 SunshinyNeko Written by VSCode
//----------------------------- 

// https://www.ietf.org/rfc/rfc1928.txt

require('kinq')();
const net = require('net');
const Sock5Proxy = require('./socks5Proxy');

class Socks5Server {
  constructor(addr, port) {
    this.addr = addr || 'localhost';
    this.port = port || 1080;
  }
  
  start() {
    let server = net.createServer((socket) => {
      new Sock5Proxy(socket);
    });
    
    server.listen(this.port, 'localhost');
    server.on('error', (err) => {
      console.log(err.code);
      process.exit(1);
    })
    
    server.on('error', (error) => {
      
    });
    
    this._server = server;
  }
  
  stop() {
    this._server.close();
  }
  
}

module.exports = Socks5Server;