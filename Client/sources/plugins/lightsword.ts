//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as crypto from 'crypto';
import * as logger from 'winston';
import { INegotiationOptions } from './main';

/**
 * LightSword Negotiation Algorithm
 */
export async function negotiate(options: INegotiationOptions): { result: boolean, reason?: string, cipherKey?: string, vNum?: number } {
  let cipherAlgorithm = options.cipherAlgorithm;
  let password = options.password;
  let proxySocket = options.proxySocket;
  
  let cipherKey = crypto.createHash('sha256').update((Math.random() * Date.now()).toString()).digest().toString('hex');
  let vNum = Number((Math.random() * Date.now()).toFixed());
  
  let handshake = {
    cipherKey,
    cipherAlgorithm,
    vNum,
    version: process.version
  };

  let handshakeCipher = crypto.createCipher(cipherAlgorithm, password);
  let hello = Buffer.concat([handshakeCipher.update(new Buffer(JSON.stringify(handshake))), handshakeCipher.final()]);
  await proxySocket.writeAsync(hello);
  
  let data = await proxySocket.readAsync();
  if (!data) return { result: false };
  
  let handshakeDecipher = crypto.createDecipher(cipherAlgorithm, cipherKey);
  let buf = Buffer.concat([handshakeDecipher.update(data), handshakeDecipher.final()]);
  try {
    let res = JSON.parse(buf.toString('utf8'));
    let okNum = Number(res.okNum);
    if (okNum !== vNum + 1) return { result: false, reason: "Can't confirm verification number." };
    
    return { result: true, vNum: okNum, cipherKey };
  } catch(ex) {
    logger.error(ex.message);
    return { result: false, reason: ex.message };
  }
  
}