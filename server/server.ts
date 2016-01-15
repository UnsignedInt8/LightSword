//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------

'use strict'

import * as net from 'net';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import * as cryptoEx from '../lib/cipher';
import { VPN_TYPE, Socks5Options, defaultCipherAlgorithm } from '../lib/constant'
import { handleSocks5 } from './socks5/index';
import { handleOSXSocks5 } from './osxcl5/index';
import * as kinq from 'kinq';

export type ServerOptions = {
  cipherAlgorithm: string,
  password: string,
  port: number,
  timeout?: number,
  expireDate?: string,
  disableSelfProtection?: boolean
}

export type UpdateServerOptions = {
  expireDate?: string,
  disableSelfProtection?: boolean
}

export class LsServer extends EventEmitter {
  disableSelfProtection = false;
  cipherAlgorithm: string;
  password: string;
  port: number;
  timeout: number;
  expireDate: string;
  blackIPs = new Set<string>();
  
  private static expireRefreshInterval = 60 * 60 * 1000;
  private remainingTime: number; // Unit: ms
  private remainingTimer: NodeJS.Timer;
  private blacklistIntervalTimer: NodeJS.Timer;
  private blacklist = new Map<string, Set<number>>();
  private server: net.Server;
  private requestHandlers = new Map<VPN_TYPE, (client: net.Socket, data: Buffer, options: Socks5Options) => boolean>();
  
  constructor(options: ServerOptions) {
    super()
    
    let me = this;
    Object.getOwnPropertyNames(options).forEach(n => me[n] = options[n]);
    
    this.requestHandlers.set(VPN_TYPE.SOCKS5, handleSocks5);
    this.requestHandlers.set(VPN_TYPE.OSXCL5, handleOSXSocks5);
  }
  
  start() {
    let me = this;
    
    let server = net.createServer(async (client) => {
      if (me.blacklist.has(client.remoteAddress) && me.blacklist.get(client.remoteAddress).size > 20) return client.dispose();
      
      let data = await client.readAsync();
      if (!data) return client.dispose();
      
      let meta = cryptoEx.SupportedCiphers[me.cipherAlgorithm];
      if (!meta) meta = cryptoEx.SupportedCiphers[defaultCipherAlgorithm];
      let ivLength = meta[1];
      
      if (data.length < ivLength) {
        console.warn(client.remoteAddress, 'Malicious Access');
        return me.addToBlacklist(client);
      }
      
      let iv = data.slice(0, ivLength);
      let decipher = cryptoEx.createDecipher(me.cipherAlgorithm, me.password, iv);
      
      let et = data.slice(ivLength, data.length);
      let dt = Buffer.concat([decipher.update(et), decipher.final()]);
      
      if (dt.length < 2) {
        console.warn(client.remoteAddress, 'Malicious Access')
        return me.addToBlacklist(client);
      }
      
      let vpnType = dt[0];
      let paddingSize = dt[1];
      
      let options = {
        iv,
        password: me.password,
        cipherAlgorithm: me.cipherAlgorithm,
        timeout: me.timeout,
        xorNum: paddingSize
      };
      
      let request = dt.slice(2 + paddingSize, data.length);
      
      let handler = me.requestHandlers.get(vpnType);
      if (!handler) return me.addToBlacklist(client);
      
      let handled = handler(client, request, options);
      
      if (handled) return;
      me.addToBlacklist(client);
    });
    
    this.server = server;
    server.listen(this.port);
    server.on('error', (err) => { 
      console.error(err.message);
      me.stop();
    });
    
    this.blacklistIntervalTimer = setInterval(() => me.blacklist.clear(), 10 * 60 * 1000);
    this.blacklistIntervalTimer.unref();
    setInterval(() => me.blackIPs.clear(), 24 * 60 * 60 * 1000).unref();
    
    this.startRemainingTimer();
  }
  
  stop() {
    if (!this.server) return;
    
    this.server.removeAllListeners();
    this.server.close();
    this.server = undefined;
      
    this.stopRemainingTimer();
    this.emit('close');
    this.blacklist.clear();
    
    if (this.blacklistIntervalTimer) clearInterval(this.blacklistIntervalTimer);
    this.blacklistIntervalTimer = undefined;
  }
  
  updateConfiguration(options: UpdateServerOptions) {
    this.disableSelfProtection = options.disableSelfProtection;
    this.expireDate = options.expireDate;
    
    this.startRemainingTimer();
  }

  private addToBlacklist(client: net.Socket) {
    if (this.disableSelfProtection) return;
    
    let ports = this.blacklist.get(client.remoteAddress);
    if (!ports) {
      ports = new Set<number>();
      this.blacklist.set(client.remoteAddress, ports);
    }
    
    ports.add(client.remotePort);
    client.dispose();
    
    this.blackIPs.add(client.remoteAddress);
  }
  
  private startRemainingTimer() {
    let me = this;
    
    this.remainingTime = this.expireDate ? (<any>(new Date(this.expireDate)) - <any>new Date()) : undefined;
    if (!this.remainingTime) return me.stopRemainingTimer();
    
    if (this.remainingTime <= 0) {
      return process.nextTick(() => {
        console.info(`${me.port} expired. ${me.expireDate} ${me.remainingTime}`);
        me.stop();
      });
    }
    
    this.stopRemainingTimer();
    
    this.remainingTimer = setInterval(() => {
      me.remainingTime -= LsServer.expireRefreshInterval;
      if (me.remainingTime > 0) return;
      
      console.info(`${me.port} expired. ${me.expireDate} ${me.remainingTime}`);
      me.stop();
    }, LsServer.expireRefreshInterval);
    
    this.remainingTimer.unref();
  }
  
  private stopRemainingTimer() {
    if (!this.remainingTimer) return;
    
    clearInterval(this.remainingTimer);
    this.remainingTimer = undefined;
  }

}