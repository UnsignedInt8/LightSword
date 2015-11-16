//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as consts from './consts';
import * as socks5Util from './util';
import * as logger from 'winston';
import { RequestOptions } from './localServer';
import { ISocks5Plugin, INegotiationOptions, IStreamTransportOptions } from '../plugins/main';

export class Socks5Connect {
  cipherAlgorithm: string;
  password: string;
  dstAddr: string;
  dstPort: number;
  serverAddr: string;
  serverPort: number;
  clientSocket: net.Socket;
  timeout: number;
  
  socks5Plugin: ISocks5Plugin;
  
  constructor(plugin: ISocks5Plugin, args: RequestOptions) {
    this.socks5Plugin = plugin;
    
    let _this = this;
    Object.getOwnPropertyNames(args).forEach(n => _this[n] = args[n]);
    
    this.connectServer();
  }
  
  connectServer() {
    let _this = this;
    
    // Handling errors, disposing resources.
    function disposeSockets(error?: Error, from?: string) {
      if (!_this || !_this || !proxySocket) return;
      logger.info(from + ': ' + (error ? error.message : 'close'));
      
      _this.clientSocket.removeAllListeners();
      _this.clientSocket.end();
      _this.clientSocket.destroy();
      proxySocket.removeAllListeners();
      proxySocket.end();
      proxySocket.destroy();
      
      _this.clientSocket = null;
      proxySocket = null;
      _this = null;
    }
    
    var proxySocket = net.connect(this.serverPort, this.serverAddr, async () => {
      logger.info(`connect: ${_this.dstAddr}`);
      
      let reply = await socks5Util.buildDefaultSocks5ReplyAsync();
      let connect = _this.socks5Plugin.getConnect();
      
      let negotiationOps: INegotiationOptions = {
        dstAddr: _this.dstAddr,
        dstPort: _this.dstPort,
        cipherAlgorithm: _this.cipherAlgorithm,
        password: _this.password,
        proxySocket
      };
      
      async function negotiateAsync(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
          connect.negotiate(negotiationOps, (success, reason) => {
            if (!success) logger.warn(reason);
            resolve(success);
          });
        });
      }
      
      // Step 1: Negotiate with server      
      let success = await negotiateAsync();
      
      reply[1] = success ? consts.REPLY_CODE.SUCCESS : consts.REPLY_CODE.CONNECTION_REFUSED;
      await _this.clientSocket.writeAsync(reply);
      if (!success) return disposeSockets(null, 'proxy');
      
      // Step 2: Transport data.
      let transportOps: IStreamTransportOptions = {
        cipherAlgorithm: _this.cipherAlgorithm,
        password: _this.password,
        clientSocket: _this.clientSocket,
        proxySocket
      };
      
      connect.transportStream(transportOps);
      
      proxySocket.once('end', () => disposeSockets(null, 'proxy end'));
      _this.clientSocket.once('end', () => disposeSockets(null, 'end end'));
      
      proxySocket.on('error', (err) => disposeSockets(err, 'proxy'));
      _this.clientSocket.on('error', (err) => disposeSockets(err, 'client'));
    });
    
    proxySocket.once('error', (error) => disposeSockets(error, 'first'));
    
    if (!this.timeout) return;
    proxySocket.setTimeout(this.timeout * 1000);
    _this.clientSocket.setTimeout(this.timeout * 1000);
  }
  
}