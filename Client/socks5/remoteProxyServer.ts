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
      let et = cipher.update(new Buffer([VPN_TYPE.SOCKS5]));
      
      let pl = Number((Math.random() * 0xff).toFixed());
      let pa = crypto.randomBytes(pl);
      let el = cipher.update(new Buffer([pl]));
      let ep = cipher.update(pa);
      
      let ed = cipher.update(request);
      
      await proxySocket.writeAsync(Buffer.concat([iv, et, el, ep, ed]));
      let decipher = cryptoEx.createDecipher(me.cipherAlgorithm, me.password, iv);
      
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