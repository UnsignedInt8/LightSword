//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import * as logger from 'winston';
import { ISocks5Options } from '../socks5/plugin';

/**
 * LightSword Negotiation Algorithm
 */
export async function negotiateAsync(socket: net.Socket, options: ISocks5Options): Promise<{ success: boolean, reason?: string, cipherKey?: iv?: Buffer, string, vNum?: number }> {
  let cipherAlgorithm = options.cipherAlgorithm;
  let password = options.password;
  let proxySocket = socket;
  
  let cipherKey = crypto.createHash('sha256').update((Math.random() * Date.now()).toString()).digest('hex');
  let vNum = Number((Math.random() * Date.now()).toFixed());
  let iv = crypto.randomBytes(16).toString('hex');
  
  let handshake = {
    padding: cipherKey.where(c => c >= 'a' && c <= 'z').toArray(),
    cipherKey,
    cipherAlgorithm,
    vNum,
    iv
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
    
    return { success: true, vNum: okNum, cipherKey, iv };
  } catch(ex) {
    logger.error(ex.message);
    return { success: false, reason: ex.message };
  }
  
}

export async function initSocks5Async(socket: net.Socket, options: ISocks5Options, cmdType: string, cipherKey: string, vNum: number): Promise<{ success: boolean, reason?: string }> {
  let proxySocket = socket;
  let connect = {
    dstAddr: options.dstAddr,
    dstPort: options.dstPort,
    type: cmdType,
    vNum
  };
  
  let cipher = crypto.createCipher(options.cipherAlgorithm, cipherKey);  
  let connectBuffer = cipher.update(new Buffer(JSON.stringify(connect)));
  await proxySocket.writeAsync(connectBuffer);
  
  let data = await proxySocket.readAsync();
  if (!data) return { success: false, reason: 'Data not available.' };
  
  let decipher = crypto.createDecipher(options.cipherAlgorithm, cipherKey);
  
  try {
    let connectOk = JSON.parse(decipher.update(data).toString());
    
    if (connectOk.vNum === vNum + 1) {
      return { success: true };
    }
    
    return { success: false, reason: "Can't confirm verification number." };
  } catch(ex) {
    return { success: false, reason: ex.message };
  }
}