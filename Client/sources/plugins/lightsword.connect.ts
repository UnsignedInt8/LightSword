//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as crypto from 'crypto';
import { ISocks5, INegotiationOptions, IStreamTransportOptions } from './main';
import { negotiate } from './lightsword';

class LightSwordConnect implements ISocks5 {
  cipherKey: string;
  vNum: number = 0;
  
  async negotiate(options: INegotiationOptions, callback: (result: boolean, reason?: string) => void) {
    let { result, reason, cipherKey, vNum } = await negotiate(options);
    callback(result, reason);
    this.cipherKey = cipherKey;
    this.vNum = vNum;
  }
  
  async transportStream(options: IStreamTransportOptions) {
    let proxySocket = options.proxySocket;
    let clientSocket = options.clientSocket;
    
    let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
    // proxySocket.on('data', data => clientSocket.write(decipher.update(data)));
    proxySocket.pipe(decipher).pipe(clientSocket);
    
    let cipher = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
    // clientSocket.on('data', (data) => proxySocket.write(cipher.update(data)));
    clientSocket.pipe(cipher).pipe(proxySocket);
  }
}

module.exports = LightSwordConnect;