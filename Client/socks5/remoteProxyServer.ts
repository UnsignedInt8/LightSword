//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import * as cryptoEx from '../../lib/cipher';
import { VPN_TYPE } from '../../lib/constant';
import { Socks5Server } from './socks5Server';

// +------+------+------+----------+------------+
// | IV   | TYPE | PLEN | RPADDING | SOCKS5DATA |
// +------+------+------+----------+------------+
// | 8-16 | 1    | 1    | 0-255    | VARIABLE   |
// +------+------+------+----------+------------+
export class RemoteProxyServer extends Socks5Server {
  
  connectRemoteServer(client: net.Socket, request: Buffer) {
    let me = this;
    
    let proxySocket = net.createConnection(this.serverPort, this.serverAddr, async () => {
      let encryptor = cryptoEx.createCipher(me.cipherAlgorithm, me.password);
      
      let cipher = encryptor.cipher;
      
      let iv = encryptor.iv;
      let pl = Number((Math.random() * 0xff).toFixed());
      let et = cipher.update(new Buffer([VPN_TYPE.SOCKS5, pl]));
      let pa = crypto.randomBytes(pl);
      let ed = cipher.update(request);

      await proxySocket.writeAsync(Buffer.concat([iv, et, pa, ed]));
      
      let data = await proxySocket.readAsync();
      if (!data) return proxySocket.dispose();
      
      let riv = new Buffer(iv.length);
      data.copy(riv, 0, 0, iv.length);
      let decipher = cryptoEx.createDecipher(me.cipherAlgorithm, me.password, riv);
      
      let rlBuf = new Buffer(1);
      data.copy(rlBuf, 0, iv.length, iv.length + 1);
      let paddingSize = decipher.update(rlBuf)[0];
      
      let reBuf = new Buffer(data.length - iv.length - 1 - paddingSize);
      data.copy(reBuf, 0, iv.length + 1 + paddingSize, data.length);
      let reply = decipher.update(reBuf);
      
      await client.writeAsync(reply);
      client.pipe(cipher).pipe(proxySocket);
      proxySocket.pipe(decipher).pipe(client);
    });
    
    function dispose() {
      client.dispose();
      proxySocket.dispose();
    }
    
    proxySocket.on('end', () => dispose);
    proxySocket.on('error', () => dispose);
    client.on('end', () => dispose);
    client.on('error', () => dispose);
    
    proxySocket.setTimeout(this.timeout);
  }
}