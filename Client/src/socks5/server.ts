//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import * as socks5const from './const';
import * as cipher from '../../../lib/build/ciphers';

type ServerOptions = {
  listenAddr: string;
  listenPort: number;
  password: string;
  cipherAlgorithm: string;
  serverAddr: string;
  serverPort: number;
  timeout: number;
}

class LocalServer {
  public listenAddr: string;
  public listenPort: number;
  public password: string;
  public cipherAlgorithm: string;
  public serverAddr: string;
  public serverPort: number;
  public timeout: number;
  
  private _server: net.Server;
  
  constructor(options: ServerOptions) {
    let _this = this;
    if (options) Object.getOwnPropertyNames(options).forEach(n => _this[n] = options[n]);
  }
  
  start() {
    if (this._server) return;
    let _this = this;
    
    let server = net.createServer(async (client) => {
      let data = await client.readAsync();
      if (!data) return client.dispose();
      
      let reply = _this.handleHandshake(data);
      await client.writeAsync(reply.data);
      if (!reply.success) return client.dispose();
      
      let request = await client.readAsync();
      
    });
    
    server.listen(this.listenPort, this.listenAddr);
    this._server = server;
  }
  
  private handleHandshake(data: Buffer): { success: boolean, data: Buffer } {
    let methodCount = data[1];
    let code = data.skip(2).take(methodCount).contains(socks5const.AUTHENTICATION.NOAUTH) 
      ? socks5const.AUTHENTICATION.NOAUTH 
      : socks5const.AUTHENTICATION.NONE;
    let success = code === socks5const.AUTHENTICATION.NOAUTH;
    
    return { success, data: new Buffer([socks5const.SOCKS_VER.V5, code]) };
  }
}