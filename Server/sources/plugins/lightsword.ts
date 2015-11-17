//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as crypto from 'crypto';
import { ISocks5Options } from './main';

export async function negotiateAsync(options: ISocks5Options): { success: boolean, reason?: string, cipherKey?: string, okNum?: number, digest?: string } {
  
  let clientSocket = options.clientSocket;
  let cipherAlgorithm = options.cipherAlgorithm;
  let password = options.password;
  
  let decipher = crypto.createDecipher(cipherAlgorithm, password);
  let data = await clientSocket.readAsync();
  if (!data) return { success: false };
  
  let buf = Buffer.concat([decipher.update(data), decipher.final()]);
  
  try {
    let handshake = JSON.parse(buf.toString('utf8'));
    let cipherKey = handshake.cipherKey;
    let clientCipherAlgorithm = handshake.cipherAlgorithm;
    let okNum = Number(handshake.vNum);
    let fields = [cipherKey, okNum, clientCipherAlgorithm];
    let digest = '';
    
    if (fields.any(f => !f)) return { success: false, reason: 'Fields lost' };
    if (typeof okNum !== 'number') return { success: false, reason: 'Not recognizable data!!!' };
    if (cipherAlgorithm !== clientCipherAlgorithm) return { success: false, reason: 'Cipher algorithm not equal' };
    
    let welcome = {
      okNum: ++okNum,
      digest
    };
    
    let cipher = crypto.createCipher(cipherAlgorithm, cipherKey);
    await clientSocket.writeAsync(Buffer.concat([cipher.update(new Buffer(JSON.stringify(welcome))), cipher.final()]));
    
    return { success: true, cipherKey, okNum };
  } catch(ex) {
    return { success: false, reason: ex.message };
  }
}