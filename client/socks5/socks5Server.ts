//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as os from 'os';
import * as net from 'net';
import * as crypto from 'crypto';
import * as cipher from '../../lib/cipher';
import { AUTHENTICATION, SOCKS_VER } from '../../lib/socks5Constant';

export type ServerOptions = {
  listenAddr: string;
  listenPort: number;
  password: string;
  cipherAlgorithm: string;
  serverAddr: string;
  serverPort: number;
  timeout: number;
  bypassLocal: boolean;
}

export abstract class Socks5Server {
  public listenAddr: string;
  public listenPort: number;
  public password: string;
  public cipherAlgorithm: string;
  public serverAddr: string;
  public serverPort: number;
  public timeout: number;
  public bypassLocal: boolean;
  
  private _server: net.Server;
  localArea = ['10.', '192.168.', 'localhost', '127.0.0.1', '172.16.', '::1', os.hostname()];

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
      
      data = await client.readAsync();
      _this.handleRequest(client, data);
    });
    
    server.listen(this.listenPort, this.listenAddr);
    server.on('error', (err) => console.error(err.message));
    this._server = server;
  }
  
  private handleHandshake(data: Buffer): { success: boolean, data: Buffer } {
    let methodCount = data[1];
    let code = data.skip(2).take(methodCount).contains(AUTHENTICATION.NOAUTH) 
      ? AUTHENTICATION.NOAUTH 
      : AUTHENTICATION.NONE;
    let success = code === AUTHENTICATION.NOAUTH;
    
    return { success, data: new Buffer([SOCKS_VER.V5, code]) };
  }
  
  abstract handleRequest(clientSocket: net.Socket, socksRequest: Buffer);
}