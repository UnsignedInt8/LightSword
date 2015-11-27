//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import * as logger from 'winston';
import { ISocks5, ISocks5Options, ISocks5TransportOptions } from '../socks5/plugin';
import { negotiateAsync, initSocks5Async } from './lightsword';

class LightSwordConnect implements ISocks5 {
  cipherKey: string;
  vNum: number = 0;
  proxySocket: net.Socket;
  
  async negotiate(options: ISocks5Options, callback: (success: boolean, reason?: string) => void) {
    let _this = this;
    
    this.proxySocket = net.createConnection(options.serverPort, options.serverAddr, async () => {
      logger.info(`connect: ${options.dstAddr}`);
      _this.proxySocket.removeAllListeners('error');

      let result = await negotiateAsync(_this.proxySocket, options);
      let success = result.success;
      let reason = result.reason;
      
      _this.cipherKey = result.cipherKey;
      _this.vNum = result.vNum;
      _this = null;
      callback(success, reason);
    });

    this.proxySocket.on('error', (error) => {
      logger.info(`connect error: ${error.message} ${options.dstAddr}:${options.dstPort}`);
      _this.proxySocket.dispose();
      _this = null;
      callback(false, error.message);
    });
    
    this.proxySocket.setTimeout(50);
    if (!options.timeout) return;
    // this.proxySocket.setTimeout(options.timeout * 1000);
  }
  
  async initSocks5Proxy(options: ISocks5Options, callback: (success: boolean, reason?: string) => void) {
    this.proxySocket.once('error', (err) => callback(false, err.message));
    let result = await initSocks5Async(this.proxySocket, options, 'connect', this.cipherKey, this.vNum);
    callback(result.success, result.reason);
    this.proxySocket.removeAllListeners('error');
  }
  
  async transport(options: ISocks5TransportOptions) {
    let _this = this;
    let proxySocket = this.proxySocket;
    let clientSocket = options.clientSocket;
    
    function disposeSocket() {
      proxySocket.dispose();
      clientSocket.dispose();
      _this = null;
    }
  
    proxySocket.once('end', () => disposeSocket());
    proxySocket.on('error', (err) => disposeSocket());
    clientSocket.once('end', () => disposeSocket());
    clientSocket.on('error', (err) => disposeSocket());
    
    let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
    proxySocket.pipe(decipher).pipe(clientSocket);
    
    let cipher = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
    clientSocket.pipe(cipher).pipe(proxySocket);
  }
}

module.exports = LightSwordConnect;