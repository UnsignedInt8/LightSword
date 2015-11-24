//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import { ATYP, AUTHENTICATION, REPLY_CODE, REQUEST_CMD } from './consts';
import * as socks5Util from './util';
import * as logger from 'winston';
import { RequestOptions } from './localServer';
import { ISocks5, ISocks5Options, IStreamTransportOptions } from './plugin';

export class Socks5Driver {
  cipherAlgorithm: string;
  password: string;
  dstAddr: string;
  dstPort: number;
  serverAddr: string;
  serverPort: number;
  clientSocket: net.Socket;
  timeout: number;
  
  executor: ISocks5;
  
  constructor(executor: ISocks5, args: RequestOptions) {
    this.executor = executor;
    
    let _this = this;
    Object.getOwnPropertyNames(args).forEach(n => _this[n] = args[n]);
    
    this.connectServer();
  }
  
  async connectServer() {
    let _this = this;
    
    // Handling errors, disposing resources.
    function disposeSocket(error?: Error, from?: string) {
      _this.clientSocket.removeAllListeners();
      _this.clientSocket.end();
      _this.clientSocket.destroy();
      
      _this.clientSocket = null;
      _this = null;
    }
    
    let connect = _this.executor;
    
    let socks5Opts: ISocks5Options = {
      cipherAlgorithm: _this.cipherAlgorithm,
      password: _this.password,
      dstAddr: _this.dstAddr,
      dstPort: _this.dstPort,
      serverAddr: _this.serverAddr,
      serverPort: _this.serverPort
    };
    
    async function negotiateAsync(): Promise<boolean> {
      return new Promise<boolean>(resolve => {
        connect.negotiate(socks5Opts, (success, reason) => {
          if (!success) logger.warn(reason);
          resolve(success);
        });
      });
    }
    
    async function sendCommandAsync(): Promise<boolean> {
      return new Promise<boolean>(resolve => {
        connect.sendCommand(socks5Opts, (success, reason) => {
          if (!success) logger.warn(reason);
          resolve(success);
        });
      });
    }

    let reply = await socks5Util.buildDefaultSocks5ReplyAsync();
    
    // Step 1: Negotiate with server      
    let success = await negotiateAsync();
    
    if (!success) {
      reply[1] = REPLY_CODE.CONNECTION_REFUSED;
      await _this.clientSocket.writeAsync(reply);
      return disposeSocket(null, 'proxy');
    }
    
    // Step 2: Send command to Server
    success = await sendCommandAsync();
    reply[1] = success ? REPLY_CODE.SUCCESS : REPLY_CODE.CONNECTION_REFUSED;
    
    // Step 3: Fill reply structure, reply client socket.
    if (connect.fillReply) reply = connect.fillReply(reply);
    
    await _this.clientSocket.writeAsync(reply);
    if (!success) return disposeSocket(null, 'proxy');
  
    // Step 4: Transport data.
    let transportOps: IStreamTransportOptions = {
      cipherAlgorithm: _this.cipherAlgorithm,
      password: _this.password,
      dstAddr: _this.dstAddr,
      dstPort: _this.dstPort,
      serverAddr: _this.serverAddr,
      serverPort: _this.serverPort,
      clientSocket: _this.clientSocket,
    };
    
    _this.clientSocket.once('end', () => disposeSocket(null, 'end end'));
    _this.clientSocket.on('error', (err) => disposeSocket(err, 'client'));
    
    connect.transport(transportOps);
  }
  
}