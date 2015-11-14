//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as os from 'os';
import * as net from 'net';
import * as util from 'util';
import * as crypto from 'crypto'; 
import * as consts from './consts';
import { RequestOptions } from './localServer';
import { IReceiver } from '../lib/dispatchQueue'

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
    let proxySocket = net.connect(this.serverPort, this.serverAddr, () => {
      
    });
  }
  
}