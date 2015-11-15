//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as consts from './consts';
import * as socks5Util from './util';
import * as logger from 'winston';
import { RequestOptions } from './localServer';
import { IReceiver } from '../lib/dispatchQueue'
import { IConnectExecutor, INegotiationOptions, ITransportOptions } from './interfaces';

export class Socks5Connect implements IReceiver {
  cipherAlgorithm: string;
  password: string;
  dstAddr: string;
  dstPort: number;
  serverAddr: string;
  serverPort: number;
  clientSocket: net.Socket;
  timeout: number;
  
  receive(msg: string, args: RequestOptions) {
    let _this = this;
    Object.getOwnPropertyNames(args).forEach(n => _this[n] = args[n]);
  }
  
  connectServer() {
    let _this = this;
    let proxySocket = net.connect(this.serverPort, this.serverAddr, async () => {
      
      let reply = await socks5Util.buildDefaultSocks5ReplyAsync();
      let executor: IConnectExecutor;
      try {
        let isLocal = ['localhost', '', undefined, null].contains(_this.serverAddr.toLowerCase());
        let plugin = '../plugins/connect/' + isLocal ? 'local' : 'main';
        executor = <IConnectExecutor>require('../plugins/connect/main').createExecutor();
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
          executor.negotiate(negotiationOps, (success) => {
            resolve(success);
          });
        });
      }
      
      async function connectDestinationAsync(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
          executor.connectDestination(negotiationOps, (success) => {
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
        _this.clientSocket.destroy();
        return proxySocket.destroy();
      }
      
      // Step 2: Reply client destination connected or not. 
      success = await connectDestinationAsync();
      
      reply[1] = success ? consts.REPLY_CODE.SUCCESS : consts.REPLY_CODE.CONNECTION_REFUSED;
      await _this.clientSocket.writeAsync(reply);
      if (!success) {
        _this.clientSocket.destroy();
        return proxySocket.destroy();
      }
      
      // Step 3: Transport data.
      let transportOps: ITransportOptions = {
        cipherAlgorithm: _this.cipherAlgorithm,
        password: _this.password,
        clientSocket: _this.clientSocket,
        proxySocket
      };
      
      executor.transport(transportOps, () => {
        _this.clientSocket.destroy();
        proxySocket.destroy();
      });
      
    });
  }
  
}