//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as consts from './consts';
import * as socks5Util from './util';
import * as logger from 'winston';
import { RequestOptions } from './localServer';
// import { IConnectExecutor, INegotiationOptions, ITransportOptions, IPluginGenerator } from './interfaces';
import { IPluginPivot, INegotiationOptions, IStreamTransportOptions } from '../plugins/main';

export class Socks5Connect {
  cipherAlgorithm: string;
  password: string;
  dstAddr: string;
  dstPort: number;
  serverAddr: string;
  serverPort: number;
  clientSocket: net.Socket;
  timeout: number;
  
  pluginPivot: IPluginPivot;
  
  constructor(plugin: IPluginPivot, args: RequestOptions, isLocal?: boolean) {
    this.pluginPivot = plugin;
    
    if (isLocal) {
      args.serverAddr = args.dstAddr;
      args.serverPort = args.dstPort;
    }
    
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
      
      
      let negotiationOps: INegotiationOptions = {
        dstAddr: _this.dstAddr,
        dstPort: _this.dstPort,
        cipherAlgorithm: _this.cipherAlgorithm,
        password: _this.password,
        proxySocket
      };
      
      async function negotiateAsync(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
          _this.pluginPivot.negotiate(negotiationOps, (success, reason) => {
            if (!success) logger.warn(reason);
            resolve(success);
          });
        });
      }
      
      // async function connectDestinationAsync(): Promise<boolean> {
      //   return new Promise<boolean>(resolve => {
      //     executor.connectDestination(negotiationOps, (success, reason) => {
      //       if (!success) logger.warn(reason);
      //       resolve(success);
      //     });
      //   });
      // }
      
      // Step 1: Negotiate with server      
      let success = await negotiateAsync();
      
      // If negotiation failed, refuse client socket
      // if (!success) {
      //   reply[1] = consts.REPLY_CODE.CONNECTION_NOT_ALLOWED;
      //   await _this.clientSocket.writeAsync(reply);
      //   return disposeSockets(null, 'proxy');
      // }
      
      // Step 2: Reply client destination connected or not. 
      // success = await connectDestinationAsync();
      
      reply[1] = success ? consts.REPLY_CODE.SUCCESS : consts.REPLY_CODE.CONNECTION_REFUSED;
      await _this.clientSocket.writeAsync(reply);
      if (!success) return disposeSockets(null, 'proxy');
      
      // Step 3: Transport data.
      let transportOps: IStreamTransportOptions = {
        cipherAlgorithm: _this.cipherAlgorithm,
        password: _this.password,
        clientSocket: _this.clientSocket,
        proxySocket
      };
      
      _this.pluginPivot.transportStream(transportOps);
      
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