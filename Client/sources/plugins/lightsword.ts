//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as crypto from 'crypto';
import * as logger from 'winston';
import { INegotiationOptions } from './main';

export async function negotiate(options: INegotiationOptions): { result: boolean, reason?: string, cipherKey?: string, vNum?: number } {
  let cipherAlgorithm = options.cipherAlgorithm;
  let proxySocket = options.proxySocket;
  let dstAddr = options.dstAddr;
  let dstPort = options.dstPort;
  
  let sha = crypto.createHash('sha256');
  sha.update((Math.random() * Date.now()).toString());
  let cipherKey = sha.digest().toString('hex');
  let vNum = Number((Math.random() * Date.now()).toFixed());
  
  let handshake = {
    cipherKey,
    cipherAlgorithm: options.cipherAlgorithm,
    vNum,
    version: process.version
  };

  let handshakeCipher = crypto.createCipher(options.cipherAlgorithm, options.password);
  let hello = Buffer.concat([handshakeCipher.update(new Buffer(JSON.stringify(handshake))), handshakeCipher.final()]);
  await proxySocket.writeAsync(hello);
  
  let data = await proxySocket.readAsync();
  if (!data) return { result: false };
  
  let handshakeDecipher = crypto.createDecipher(options.cipherAlgorithm, cipherKey);
  let buf = Buffer.concat([handshakeDecipher.update(data), handshakeDecipher.final()]);
  try {
    let res = JSON.parse(buf.toString('utf8'));
    let okNum = Number(res.okNum);
    if (okNum !== vNum + 1) return { result: false, reason: "Can't confirm verification number." };
    
    let { result, reason } = await connect();
    return { result, vNum: okNum, cipherKey };
  } catch(ex) {
    logger.error(ex.message);
    return { result: false, reason: ex.message };
  }
  
  // Connect to destination resource.  
  async function connect(): { result: boolean, reason?: string } {
    let connect = {
      dstAddr: dstAddr,
      dstPort: dstPort,
      vNum: vNum,
      type: 'connect'
    };
    
    let cipher = crypto.createCipher(cipherAlgorithm, .cipherKey);  
    let connectBuffer = cipher.update(new Buffer(JSON.stringify(connect)));
    await proxySocket.writeAsync(connectBuffer);
    
    let data = await proxySocket.readAsync();
    if (!data) return { result: false, reason: 'Data not available.' };
    
    let decipher = crypto.createDecipher(cipherAlgorithm, .cipherKey);
    
    try {
      let connectOk = JSON.parse(decipher.update(data).toString());
      
      if (connectOk.vNum === connect.vNum + 1) {
        return { result: true };
      }
      
      return { result: false, "Can't confirm verification number." };
    } catch(ex) {
      return { result: false, reason: ex.message };
    }
  }
}