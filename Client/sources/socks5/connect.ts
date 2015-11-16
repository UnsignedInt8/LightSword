//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as consts from './consts';
import * as socks5Util from './util';
import * as logger from 'winston';
import { RequestOptions } from './localServer';
import { IConnectExecutor, INegotiationOptions, ITransportOptions, IPluginGenerator } from './interfaces';

export class Socks5Connect {
  cipherAlgorithm: string;
  password: string;
  dstAddr: string;
  dstPort: number;
  serverAddr: string;
  serverPort: number;
  clientSocket: net.Socket;
  timeout: number;
  
  connectPlugin: IPluginGenerator;
  static count = 0;
  
  constructor(plugin: IPluginGenerator, args: RequestOptions, isLocal?: boolean) {
    this.connectPlugin = plugin;
    
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
    let proxySocket = net.connect(this.serverPort, this.serverAddr, async () => {
      logger.info('connect: ' + _this.dstAddr);
      logger.info('count: ' + ++Socks5Connect.count);
      
      let reply = await socks5Util.buildDefaultSocks5ReplyAsync();
      let executor: IConnectExecutor;
      try {
        executor = <IConnectExecutor>_this.connectPlugin.createExecutor();
      } catch(ex) {
        logger.error(ex.message);
        return process.exit(1);
      }
      
      let negotiationOps: INegotiationOptions = {
        dstAddr: _this.dstAddr,
        dstPort: _this.dstPort,
        cipherAlgorithm: _this.cipherAlgorithm,
        password: _this.password,
        proxySocket
      };
      
      async function negotiateAsync(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
          executor.negotiate(negotiationOps, (success, reason) => {
            if (!success) logger.warn(reason);
            resolve(success);
          });
        });
      }
      
      async function connectDestinationAsync(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
          executor.connectDestination(negotiationOps, (success, reason) => {
            if (!success) logger.warn(reason);
            resolve(success);
          });
        });
      }
      
      // Step 1: Negotiate with server      
      let success = await negotiateAsync();
      
      // If negotiation failed, refuse client socket
      if (!success) {
        reply[1] = consts.REPLY_CODE.CONNECTION_NOT_ALLOWED;
        await _this.clientSocket.writeAsync(reply);
        return disposeSockets();
      }
      
      // Step 2: Reply client destination connected or not. 
      success = await connectDestinationAsync();
      
      reply[1] = success ? consts.REPLY_CODE.SUCCESS : consts.REPLY_CODE.CONNECTION_REFUSED;
      await _this.clientSocket.writeAsync(reply);
      if (!success) return disposeSockets();
      
      // Step 3: Transport data.
      let transportOps: ITransportOptions = {
        cipherAlgorithm: _this.cipherAlgorithm,
        password: _this.password,
        clientSocket: _this.clientSocket,
        proxySocket
      };
      
      executor.transport(transportOps, () => {
        disposeSockets();
      });
      
      // Handling errors, disposing resources.
      function disposeSockets(error?: Error, from?: string) {
        if (_this.clientSocket === null || proxySocket === null) return;
        logger.info(from + ': ' + (error ? error.message : 'close'));
        
        _this.clientSocket.end();
        _this.clientSocket.removeAllListeners();
        _this.clientSocket.destroy();
        proxySocket.end();
        proxySocket.removeAllListeners();
        proxySocket.destroy();
        
        _this.clientSocket = null;
        proxySocket = null;
        
        logger.info('count: ' + --Socks5Connect.count);
      }
      
      proxySocket.on('error', (err) => disposeSockets(err, 'proxy'));
      _this.clientSocket.on('error', (err) => disposeSockets(err, 'client'));
    });
    
    proxySocket.once('error', (error) => { logger.info('first ' + error.message); proxySocket.destroy(); });
    
    if (!this.timeout) return;
    proxySocket.setTimeout(this.timeout * 1000);
  }
  
}