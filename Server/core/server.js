//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const net = require('net');

class LightSwordServer {
  constructor(options) {
    this._port = options.port || 23333;
    this._password = options.password;
    this._cipherAlgorithm = options.cipherAlgorithm;
  }
  
  start() {
    let server = net.createServer((socket) => {
      socket.once('data', (data) => {
        
      })
    });
    
    server.listen(this._port);
  }
}

module.exports = LightSwordServer;