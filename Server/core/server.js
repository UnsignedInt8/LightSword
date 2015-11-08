//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const net = require('net');
const requestHandler = require('./requestHandler');

class LightSwordServer {
  constructor(options) {
    this._port = options.port || 23333;
    this._password = options.password;
    this._cipherAlgorithm = options.cipherAlgorithm;
  }
  
  start() {
    let server = net.createServer((socket) => {
      let options = {
        socket,
        password: this.password,
        cipherAlgorithm: this._cipherAlgorithm
      };
      
      requestHandler(options);
    });
    
    server.listen(this._port);
  }
}

module.exports = LightSwordServer;