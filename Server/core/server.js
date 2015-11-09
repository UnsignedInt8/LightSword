//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const net = require('net');
const requestHandler = require('./requestHandler');

class LightSwordServer {
  constructor(options) {
    this.port = options.port || 23333;
    this.password = options.password || 'lightsword';
    this.cipherAlgorithm = options.cipherAlgorithm || 'aes-256-cfb';
  }
  
  start() {
    let server = net.createServer((socket) => {
      let options = {
        clientSocket: socket,
        password: this.password,
        cipherAlgorithm: this.cipherAlgorithm
      };
      
      requestHandler(options);
    });
    
    server.listen(this.port);
  }
}

module.exports = LightSwordServer;