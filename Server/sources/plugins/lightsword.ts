//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import { ISocks5, ISocks5Options } from './main';

class LightSwordSocks5 implements ISocks5 {
  cipherKey: string;
  vNum: number = 0;
  digest: string;
  
  async negotiate (options: ISocks5Options, callback: (success: boolean, reason?: string) => void) {
    let clientSocket = options.clientSocket;
    let cipherAlgorithm = options.cipherAlgorithm;
    let password = options.password;
    
    let decipher = crypto.createDecipher(cipherAlgorithm, password);
    let data = await clientSocket.readAsync();
    if (!data) return callback(false);
    
    let buf = Buffer.concat([decipher.update(data), decipher.final()]);
    
    try {
      let msgDigest = buf.toString('utf8');
      if (1 !== msgDigest.count(c => c === '\n')) return callback(false, 'Format error');
      
      let n = msgDigest.indexOf('\n');
      if (n < 0) return callback(false, 'Format error');
      let digest = msgDigest.substr(n + 1);
      
      let handshake = JSON.parse(msgDigest.substr(0, n));
      let cipherKey = handshake.cipherKey;
      let clientCipherAlgorithm = handshake.cipherAlgorithm;
      let okNum = Number(handshake.vNum);
      let fields = [cipherKey, okNum, clientCipherAlgorithm];
      
      if (fields.any(f => !f)) return callback(false, 'Fields lost.');
      if (typeof okNum !== 'number') return callback(false, 'Not recognizable data!!!');
      if (cipherAlgorithm !== clientCipherAlgorithm) return callback(false, 'Cipher algorithm not equal.');
      
      let welcome = {
        okNum: ++okNum,
        digest
      };
      
      let cipher = crypto.createCipher(cipherAlgorithm, cipherKey);
      await clientSocket.writeAsync(Buffer.concat([cipher.update(new Buffer(JSON.stringify(welcome))), cipher.final()]));
      
      this.cipherKey = cipherKey;
      this.vNum = okNum;
      this.digest = digest;
      
      return callback(true);
    } catch(ex) {
      return callback(false, ex.message);
    }
  }
  
  async transport (options: ISocks5Options) {
    
    let clientSocket = options.clientSocket;
    let cipherAlgorithm = options.cipherAlgorithm;
    
    function disposeSocket() {
      clientSocket.removeAllListeners();
      clientSocket.end();
      clientSocket.destroy();
      
      if (!proxySocket) return;
      proxySocket.removeAllListeners();
      proxySocket.end();
      proxySocket.destroy();
    }
    
    // Resolving Command Type
    let cmdData = await clientSocket.readAsync();
    let decipher = crypto.createDecipher(cipherAlgorithm, this.cipherKey);
    let buf = Buffer.concat([decipher.update(cmdData), decipher.final()]);
    let request;
      
    try {
      request = JSON.parse(buf.toString('utf8'));
    } catch(ex) {
      return disposeSocket();
    }
    
    if (request.vNum !== this.vNum) return disposeSocket();
    
    let dstAddr = request.dstAddr;
    let dstPort = request.dstPort;
    let cmdType = request.type;

    var proxySocket = net.createConnection(dstPort, dstAddr, async () => {      
      let cipherOnce = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
      let conncetOk = { msg: 'connect ok', vNum: this.vNum + 1, digest: this.digest };
      await clientSocket.writeAsync(Buffer.concat([cipherOnce.update(new Buffer(JSON.stringify(conncetOk))), cipherOnce.final()]));
      
      let cipher = crypto.createCipher(cipherAlgorithm, this.cipherKey);
      let decipher = crypto.createDecipher(cipherAlgorithm, this.cipherKey);
      proxySocket.pipe(cipher).pipe(clientSocket);
      clientSocket.pipe(decipher).pipe(proxySocket);
    });
    
    proxySocket.on('error', (err) => disposeSocket());
    clientSocket.on('error', (err) => disposeSocket());
    
    proxySocket.on('end', () => disposeSocket());
    clientSocket.on('end', () => disposeSocket());
  }
}

module.exports = LightSwordSocks5;