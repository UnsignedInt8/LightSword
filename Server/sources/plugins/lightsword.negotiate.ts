//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as crypto from 'crypto';
import { INegotitationOptions } from './main';

export async function negotiate(options: INegotitationOptions): { result: boolean, reason?: string, cipherKey?: string, okNum?: number  } {
  
  let clientSocket = options.clientSocket;
  let cipherAlgorithm = options.cipherAlgorithm;
  let password = options.password;
  
  let decipher = crypto.createDecipher(cipherAlgorithm, password);
  let data = await clientSocket.readAsync();
  if (!data) return { result: false };
  
  let buf = Buffer.concat([decipher.update(data), decipher.final()]);
  
  try {
    let handshake = JSON.parse(buf.toString('utf8'));
    let cipherKey = handshake.cipherKey;
    let clientCipherAlgorithm = handshake.cipherAlgorithm;
    let okNum = Number(handshake.vNum);
    let fields = [cipherKey, okNum, clientCipherAlgorithm];
    
    if (fields.any(f => !f)) return { result: false, reason: 'Fields lost' };
    if (typeof okNum !== 'number') return { result: false, reason: 'Not recognizable data!!!' };
    if (cipherAlgorithm !== clientCipherAlgorithm) return { result: false, reason: 'Cipher algorithm not equal' };
    
    let welcome = {
      okNum: ++okNum
    };
    
    let cipher = crypto.createCipher(cipherAlgorithm, cipherKey);
    await clientSocket.writeAsync(Buffer.concat([cipher.update(new Buffer(JSON.stringify(welcome))), cipher.final()]));
    
    return { result: true, cipherKey, okNum };
  } catch(ex) {
    return { result: false, reason: ex.message };
  }
}