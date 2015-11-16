//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as crypto from 'crypto';
import * as logger from 'winston';
import { IConnectExecutor, INegotiationOptions, IConnectDestinationOptions, ITransportOptions } from '../../socks5/interfaces';

/**
 * LightSword Default Connect Implementator
 */
class LightSwordConnectExecutor implements IConnectExecutor {
  
  cipherKey: string;
  vNum: number;

  async negotiate(options: INegotiationOptions, callback: (result: boolean, reason?: string) => void) {
    let proxySocket = options.proxySocket;
    
    let sha = crypto.createHash('sha256');
    sha.update((Math.random() * Date.now()).toString());
    let cipherKey = sha.digest().toString('hex');
    
    let vNum = Number((Math.random() * Date.now()).toFixed());
    
    let handshake = {
      cipherKey,
      cipherAlgorithm: options.cipherAlgorithm,
      vNum,
      version: process.versions
    };

    let handshakeCipher = crypto.createCipher(options.cipherAlgorithm, options.password);
    let hello = Buffer.concat([handshakeCipher.update(new Buffer(JSON.stringify(handshake))), handshakeCipher.final()]);
    await proxySocket.writeAsync(hello);
    
    let data = await proxySocket.readAsync();
    if (!data) return callback(false);
    
    let handshakeDecipher = crypto.createDecipher(options.cipherAlgorithm, cipherKey);
    let buf = Buffer.concat([handshakeDecipher.update(data), handshakeDecipher.final()]);
    try {
      let res = JSON.parse(buf.toString('utf8'));
      let okNum = Number(res.okNum);
      if (okNum !== vNum + 1) return callback(false, "Can't confirm verification number.");

      this.cipherKey = cipherKey;    
      this.vNum = okNum;
      
      callback(true);
    } catch(ex) {
      logger.error(ex.message);
      callback(false, ex.message);
    }
  }
  
  async connectDestination(options: IConnectDestinationOptions, callback: (result: boolean, reason?: string) => void) {
    let proxySocket = options.proxySocket;
    
    let connect = {
      dstAddr: options.dstAddr,
      dstPort: options.dstPort,
      vNum: this.vNum,
      type: 'connect'
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
  
  transport(options: ITransportOptions) {
    let proxySocket = options.proxySocket;
    let clientSocket = options.clientSocket;
    
    let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
    proxySocket.on('data', data => clientSocket.write(decipher.update(data)));
    
    let cipher = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
    clientSocket.on('data', (data) => proxySocket.write(cipher.update(data)));
  }
}

module.exports = LightSwordConnectExecutor;