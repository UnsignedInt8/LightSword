//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'


import * as net from 'net';
import * as crypto from '../lib/cipher';
import { VPN_TYPE } from '../lib/constant'
import { handleSocks5 } from './socks5/index';
import { handleOSXSocks5 } from './osxcl5/index';

export class LsServer {
  cipherAlgorithm: string;
  password: string;
  port: number;
  timeout: number;
  
  private blacklist = new Set<string>();
  private server: net.Server;
  
  constructor(options: { cipherAlgorithm: string, password: string, port: number }) {
    let _this = this;
    Object.getOwnPropertyNames(options).forEach(n => _this[n] = options[n]);
  }
  
  start() {
    let me = this;
    
    let server = net.createServer(async (client) => {
      if (me.blacklist.has(client.remoteAddress)) return client.dispose();
      
      let data = await client.readAsync();
      if (!data) return client.dispose();
      
      let meta = crypto.SupportedCiphers[me.cipherAlgorithm];
      let ivLength = meta[1];
      let iv = data.slice(0, ivLength);
      
      let decipher = crypto.createDecipher(me.cipherAlgorithm, me.password, iv);
      
      let et = data.slice(ivLength, data.length);
      let dt = decipher.update(et);
      let vpnType = dt[0];
      let paddingSize = dt[1];
      
      let options = {
        decipher,
        password: me.password,
        cipherAlgorithm: me.cipherAlgorithm,
        timeout: me.timeout
      };
      
      let request = dt.slice(2 + paddingSize, data.length);
      
      let handled = false;
      switch (vpnType) {
        case VPN_TYPE.SOCKS5:
          handled = handleSocks5(client, request, options);
          break;
        case VPN_TYPE.OSXCL5:
          handled = handleOSXSocks5(client, request, options);
          break;
      }
      
      if (handled) return;
      me.blacklist.add(client.remoteAddress);
      client.dispose();
    });
    
    server.listen(this.port);
    server.on('error', (err) => console.error(err.message));
    this.server = server;
    
    setInterval(() => me.blacklist.clear(), 10 * 60 * 1000);
  }
  
  stop() {
    this.server.end();
    this.server.close();
    this.server.destroy();
  }
    
}