//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'


import * as net from 'net';
import * as crypto from '../lib/cipher';
import { VPN_TYPE } from '../lib/constant'
import { HandleSocks5 } from './socks5/index';

export class Socks5Server {
  cipherAlgorithm: string;
  password: string;
  port: number;
  
  _server: net.Server;
  
  constructor(options: { cipherAlgorithm: string, password: string, port: number, plugin: string }) {
    let _this = this;
    ['cipherAlgorithm', 'password', 'port'].forEach(n => _this[n] = options[n]);
  }
  
  start() {
    let me = this;
    
    let server = net.createServer(async (client) => {
      let data = await client.readAsync();
      if (!data) return client.dispose();
      
      let meta = crypto.SupportedCiphers[me.cipherAlgorithm] || crypto.SupportedCiphers[crypto.DefaultAlgorithm];
      let ivLength = meta[1];
      let iv = new Buffer(ivLength);
      data.copy(iv, 0, 0, ivLength);
      
      let decipher = crypto.createDecipher(me.cipherAlgorithm, me.password, iv);
      
      let vpnTypeBuf = new Buffer(1);
      data.copy(vpnTypeBuf, 0, ivLength, ivLength + 1);
      let vpnType = decipher.update(vpnTypeBuf)[0];
      
      let paddingSizeBuf = new Buffer(1);
      data.copy(paddingSizeBuf, 0, ivLength + 2, ivLength + 3);
      let paddingSize = decipher.update(paddingSizeBuf)[0];
      
      let request = new Buffer(data.length - ivLength - 3 - paddingSize);
      data.copy(request, 0, ivLength + 3 + paddingSize, data.length);
      request = decipher.update(request);
      
      if (vpnType === VPN_TYPE.SOCKS5) {
        return HandleSocks5(client, request);
      }
      
      client.dispose();
    });
    
    server.listen(this.port);
    server.on('error', (err) => console.error(err.message));
    this._server = server;
  }
  
  stop() {
    this._server.end();
    this._server.close();
    this._server.destroy();
  }
}