//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import * as logger from 'winston';
import { ISocks5, ISocks5Options, IStreamTransportOptions } from '../socks5/plugin';
import { negotiateAsync } from './lightsword';

class LightSwordConnect implements ISocks5 {
  cipherKey: string;
  vNum: number = 0;
  proxySocket: net.Socket;
  
  disposeSocket(error: Error, from: any) {
    this.proxySocket.removeAllListeners();
    this.proxySocket.end();
    this.proxySocket.destroy();
    this.proxySocket = null;
  }
  
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
      _this.disposeSocket(error, 'connect');
      _this = null;
      callback(false, error.message);
    });
    
    if (!options.timeout) return;
    this.proxySocket.setTimeout(options.timeout * 1000);
  }
  
  async sendCommand(options: ISocks5Options, callback: (success: boolean, reason?: string) => void) {
    let proxySocket = this.proxySocket;
    let vNum = this.vNum;
    let connect = {
      dstAddr: options.dstAddr,
      dstPort: options.dstPort,
      type: 'connect',
      vNum
    };
    
    let cipher = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);  
    let connectBuffer = cipher.update(new Buffer(JSON.stringify(connect)));
    await proxySocket.writeAsync(connectBuffer);
    
    let data = await proxySocket.readAsync();
    if (!data) return callback(false, 'Data not available.');
    
    let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
    
    try {
      let connectOk = JSON.parse(decipher.update(data).toString());
      
      if (connectOk.vNum === connect.vNum + 1) {
        return callback(true);
      }
      
      return callback(false, "Can't confirm verification number.");
    } catch(ex) {
      return callback(false, ex.message);
    }
  }
  
  async transport(options: IStreamTransportOptions) {
    let _this = this;
    let proxySocket = this.proxySocket;
    let clientSocket = options.clientSocket;
  
    proxySocket.once('end', () => _this.disposeSocket(null, 'proxy end'));
    proxySocket.on('error', (err) => _this.disposeSocket(err, 'proxy error'));
    
    let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
    proxySocket.pipe(decipher).pipe(clientSocket);
    
    let cipher = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
    clientSocket.pipe(cipher).pipe(proxySocket);
  }
}

module.exports = LightSwordConnect;