//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as os from 'os';
import * as net from 'net';
import * as util from 'util';
import * as crypto from 'crypto'; 
import * as consts from './consts';
import * as socks5Util from './util';
import { RequestOptions } from './localServer';
import { IReceiver } from '../lib/dispatchQueue'
import * as interfaces from './interfaces';

export class Socks5Connect implements IReceiver {
  cipherAlgorithm: string;
  password: string;
  dstAddr: string;
  dstPort: number;
  serverAddr: string;
  serverPort: number;
  clientSocket: net.Socket;
  timeout: number;
  
  receive(msg: string, args: any) {
    let options = <RequestOptions>args;
    let _this = this;
    Object.getOwnPropertyNames(options).forEach(n => _this[n] = options[n]);
  }
  
  connectServer() {
    let _this = this;
    let proxySocket = net.connect(this.serverPort, this.serverAddr, async () => {
      let reply = await socks5Util.buildDefaultSocks5ReplyAsync();
      let executor = <interfaces.IConnectExecutor>require('../plugins/connect/main');
      
      let negotiater = executor.negotiate;
      let negotiationOps: interfaces.INegotiationOptions = {
        dstAddr: _this.dstAddr,
        dstPort: _this.dstPort,
        cipherAlgorithm: _this.cipherAlgorithm,
        password: _this.password,
        proxySocket
      };
      
      // Step1: negotiate with server
      negotiater(negotiationOps, async (success) => {
        
        // If negotiation failed, refuse client socket
        if (!success) {
          reply[1] = consts.REPLY_CODE.CONNECTION_NOT_ALLOWED;
          await _this.clientSocket.writeAsync(reply);
          _this.clientSocket.destroy();
          return proxySocket.destroy();
        }
        
        // Step2
        let transporter = executor.transport;
        let transportOps: interfaces.ITransportOptions = {
          cipherAlgorithm: _this.cipherAlgorithm,
          password: _this.password,
          clientSocket: _this.clientSocket,
          proxySocket
        }
        
        transporter(transportOps, () => {
          
        });
      });
    });
  }
  
}