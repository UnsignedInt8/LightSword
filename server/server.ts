//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'


import * as net from 'net';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import * as cryptoEx from '../lib/cipher';
import { VPN_TYPE } from '../lib/constant'
import { handleSocks5 } from './socks5/index';
import { handleOSXSocks5 } from './osxcl5/index';

export type ServerOptions = {
  cipherAlgorithm: string,
  password: string,
  port: number,
  timeout?: number
}

export class LsServer extends EventEmitter {
  cipherAlgorithm: string;
  password: string;
  port: number;
  timeout: number;
  
  private blacklist = new Set<string>();
  private server: net.Server;
  
  constructor(options: ServerOptions) {
    super()
    
    let _this = this;
    Object.getOwnPropertyNames(options).forEach(n => _this[n] = options[n]);
  }
  
  start() {
    let me = this;
    
    let server = net.createServer(async (client) => {
      if (me.blacklist.has(client.remoteAddress)) return client.dispose();
      
      let data = await client.readAsync();
      if (!data) return client.dispose();
      
      let meta = cryptoEx.SupportedCiphers[me.cipherAlgorithm];
      let ivLength = meta[1];
      
      if (data.length < ivLength) {
        console.warn(client.remoteAddress, 'Harmful Access');
        return me.addToBlacklist(client);
      }
      
      let iv = data.slice(0, ivLength);
      let decipher = cryptoEx.createDecipher(me.cipherAlgorithm, me.password, iv);
      
      let et = data.slice(ivLength, data.length);
      let dt = decipher.update(et);
      let vpnType = dt[0];
      let paddingSize = dt[1];
      
      let options = {
        decipher,
        password: me.password,
        cipherAlgorithm: me.cipherAlgorithm,
        timeout: me.timeout,
        xorNum: paddingSize
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
      me.addToBlacklist(client);
    });
    
    this.server = server;
    server.listen(this.port);
    server.on('error', (err) => { 
      console.error(err.message);
      me.stop(); 
    });
    
    setInterval(() => me.blacklist.clear(), 10 * 60 * 1000);
  }
  
  stop() {
    this.server.end();
    this.server.close();
    this.server.destroy();
    this.emit('close');
  }

  addToBlacklist(client: net.Socket) {
    this.blacklist.add(client.remoteAddress);
    client.dispose();
  }
}