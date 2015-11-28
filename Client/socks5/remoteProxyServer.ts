//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from '../../lib/cipher';
import { VPN_TYPE } from '../../lib/socks5Constant';
import { Socks5Server } from './socks5Server';

// +------+------+-------+
// | IV   | TYPE | DATA  |
// +------+------+-------+
// | 8-16 | 1    | VAR   |
// +------+------+-------+
export class RemoteProxyServer extends Socks5Server {
  
  connectRemoteServer(client: net.Socket, request: Buffer) {
    let me = this;

    let proxySocket = net.createConnection(this.serverPort, this.serverAddr, async () => {
      let encryptor = crypto.createCipher(me.cipherAlgorithm, me.password);
      let cipher = encryptor.cipher;
      let et = cipher.update(new Buffer(VPN_TYPE.SOCKS5));
      let ed = cipher.update(request);
      
      await proxySocket.writeAsync(Buffer.concat([encryptor.iv, et, ed]));
      
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