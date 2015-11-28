//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';

export class Socks5Server {
  cipherAlgorithm: string;
  password: string;
  port: number;
  
  _server: net.Server;
  
  constructor(options: { cipherAlgorithm: string, password: string, port: number, plugin: string }) {
    let _this = this;
    ['cipherAlgorithm', 'password', 'port'].forEach(n => _this[n] = options[n]);
  }
  
  start() {
    let server = net.createServer((client) => {
      
    });
    
    server.listen(this.port);
    server.on('error', (err) => console.error(err.message));
    this._server = server;
  }
  
  stop() {
    this._server.end();
    this._server.close();
    this._server.destroy();
  }
}