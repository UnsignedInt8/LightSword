//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as logger from 'winston';
import * as socks5Util from './util';
import { RequestOptions } from './localServer';
import { ATYP, AUTHENTICATION, REPLY_CODE, REQUEST_CMD } from './consts';
import { ISocks5, ISocks5Options, ISocks5TransportOptions } from './plugin';

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
      _this.clientSocket.dispose();
      _this.clientSocket = null;
      _this = null;
    }
    
    let executor = _this.executor;
    
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
        executor.negotiate(socks5Opts, (success, reason) => {
          if (!success) logger.warn(reason);
          resolve(success);
        });
      });
    }
    
    async function sendCommandAsync(): Promise<boolean> {
      return new Promise<boolean>(resolve => {
        executor.initSocks5Proxy(socks5Opts, (success, reason) => {
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
    if (executor.fillReply) reply = executor.fillReply(reply);
    
    await _this.clientSocket.writeAsync(reply);
    if (!success) return disposeSocket(null, 'proxy');

    // Step 4: Transport data.
    let transportOps: ISocks5TransportOptions = {
      cipherAlgorithm: _this.cipherAlgorithm,
      password: _this.password,
      dstAddr: _this.dstAddr,
      dstPort: _this.dstPort,
      serverAddr: _this.serverAddr,
      serverPort: _this.serverPort,
      clientSocket: _this.clientSocket,
    };
    
    executor.transport(transportOps);
  }
  
}