//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as logger from 'winston';

export class Server {
  cipherAlgorithm: string;
  password: string;
  port: number;
  
  _server: net.Server;
  
  start() {
    let server = net.createServer((socket) => {
      
    });
    
    server.listen(this.port);
    server.on('error', (err) => logger.error(err.message));

    this._server = server;
  }
  
  stop() {
    if (!this._server) return;
    
    this._server.removeAllListeners();
    this._server.close();
    this._server.destroy();
    this._server = null;
  }
}