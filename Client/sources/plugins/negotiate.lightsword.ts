//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import * as logger from 'winston';
import { INegotiationOptions } from './main';


export async function lightswordNegotiate(options: INegotiationOptions, callback: (result: boolean, reason?: string) => void) {
    
  let cipherAlgorithm = options.cipherAlgorithm;
  let proxySocket = options.proxySocket;
  let dstAddr = options.dstAddr;
  let dstPort = options.dstPort;
  let cipherKey: string;
  let vNum: number = 0;
  
  let sha = crypto.createHash('sha256');
  sha.update((Math.random() * Date.now()).toString());
  cipherKey = sha.digest().toString('hex');
  
  vNum = Number((Math.random() * Date.now()).toFixed());
  
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
    
    vNum = okNum;
    
    await connect(callback);
  } catch(ex) {
    logger.error(ex.message);
    callback(false, ex.message);
  }
  
  // Connect to destination resource.  
  async function connect(callback: (result: boolean, reason?: string) => void) {
    let connect = {
      dstAddr: dstAddr,
      dstPort: dstPort,
      vNum: vNum,
      type: 'connect'
    };
    
    let cipher = crypto.createCipher(cipherAlgorithm, this.cipherKey);  
    let connectBuffer = cipher.update(new Buffer(JSON.stringify(connect)));
    await proxySocket.writeAsync(connectBuffer);
    
    let data = await proxySocket.readAsync();
    if (!data) return callback(false, 'Data not available.');
    
    let decipher = crypto.createDecipher(cipherAlgorithm, this.cipherKey);
    
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

}

module.exports = lightswordNegotiate;