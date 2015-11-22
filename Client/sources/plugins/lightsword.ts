//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as crypto from 'crypto';
import * as logger from 'winston';
import { INegotiationOptions } from '../socks5/plugin';

/**
 * LightSword Negotiation Algorithm
 */
export async function negotiateAsync(options: INegotiationOptions): Promise<{ success: boolean, reason?: string, cipherKey?: string, vNum?: number }> {
  let cipherAlgorithm = options.cipherAlgorithm;
  let password = options.password;
  let proxySocket = options.proxySocket;
  
  let cipherKey = crypto.createHash('sha256').update((Math.random() * Date.now()).toString()).digest('hex');
  let vNum = Number((Math.random() * Date.now()).toFixed());
  
  let handshake = {
    padding: cipherKey.where(c => c >= 'a' && c <= 'z').toArray(),
    cipherKey,
    cipherAlgorithm,
    vNum,
    version: process.version
  };

  let handshakeCipher = crypto.createCipher(cipherAlgorithm, password);
  let message = JSON.stringify(handshake);
  let digest = crypto.createHash('md5').update(message).digest('hex');
  message = `${message}\n${digest}`;
  let hello = Buffer.concat([handshakeCipher.update(new Buffer(message)), handshakeCipher.final()]);
  await proxySocket.writeAsync(hello);
  
  let data = await proxySocket.readAsync();
  if (!data) return { success: false };
  
  let handshakeDecipher = crypto.createDecipher(cipherAlgorithm, cipherKey);
  let buf = Buffer.concat([handshakeDecipher.update(data), handshakeDecipher.final()]);
  try {
    let res = JSON.parse(buf.toString('utf8'));
    let okNum = Number(res.okNum);
    
    if (res.digest !== digest) return { success: false, reason: 'Message has been falsified' };
    if (okNum !== vNum + 1) return { success: false, reason: "Can't confirm verification number." };
    
    return { success: true, vNum: okNum, cipherKey };
  } catch(ex) {
    logger.error(ex.message);
    return { success: false, reason: ex.message };
  }
  
}