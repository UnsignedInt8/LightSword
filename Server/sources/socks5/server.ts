//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import * as logger from 'winston';
import { defaultQueue } from '../lib/dispatchQueue';



export class Server {
  cipherAlgorithm: string;
  password: string;
  port: number;
  
  _server: net.Server;
  
  constructor(options: { cipherAlgorithm: string, password: string, port: number }) {
    let _this = this;
    Object.getOwnPropertyNames(options).forEach(n => _this[n] = options[n]);
  }
  
  start() {
    let _this = this;
    
    let server = net.createServer(async (socket) => {
      let data = await socket.readAsync();
      if (!data) return socket.destroy();
      
      // Step 1: Negotiate with client.
      let decipher = crypto.createDecipher(_this.cipherAlgorithm, _this.password);
      let negotiationBuf = Buffer.concat([decipher.update(data), decipher.final()]);
      
      try {
        let msg = JSON.parse(negotiationBuf.toString('utf8'));
      } catch(ex) {
        socket.end();
        return socket.destroy();
      }
      
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