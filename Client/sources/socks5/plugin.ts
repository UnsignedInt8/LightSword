//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import { REQUEST_CMD } from './consts';

export interface ISocks5Options {
  cipherAlgorithm: string;
  password: string;
  dstAddr: string;
  dstPort: number;
  serverAddr: string;
  serverPort: number;
  timeout?: number;
}

export interface ISocks5TransportOptions extends ISocks5Options {
  clientSocket: net.Socket;
}

export interface ISocks5 {
  // Step 1: Negotiate with Server.
  negotiate: (options: ISocks5Options, callback: (result: boolean, reason?: string) => void) => void;
  
  // Step 2: Send SOCKS5 Command to Server.
  sendCommand: (options: ISocks5Options, callback: (result: boolean, reason?: string) => void) => void;
  
  // Step 3: Fill socks5 reply structure.
  // +----+-----+-------+------+----------+----------+
  // |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
  // +----+-----+-------+------+----------+----------+
  // | 1  |  1  | X'00' |  1   | Variable |    2     |
  // +----+-----+-------+------+----------+----------+
  fillReply?: (reply: Buffer) => Buffer;
  
  // Step 3: Transport data.
  transport?: (options: ISocks5TransportOptions) => void;
}

export interface ISocks5Plugin {
  getSocks5: (cmd: REQUEST_CMD) => ISocks5;
}

export class PluginPivot implements ISocks5Plugin {
  components = new Map<string, any>();
  cmdMap = new Map<REQUEST_CMD, string>();
  
  constructor(plugin: string) {
    let _this = this;
    this.cmdMap.set(REQUEST_CMD.BIND, 'bind');
    this.cmdMap.set(REQUEST_CMD.CONNECT, 'connect');
    this.cmdMap.set(REQUEST_CMD.UDP_ASSOCIATE, 'udpAssociate');
    
    ['connect' /* , 'bind' */, 'udpAssociate'].forEach(c => _this.components.set(c, require(`../plugins/${plugin}.${c}`)));
  }
  
  getSocks5(cmd: REQUEST_CMD): ISocks5 {
    return new (this.components.get(this.cmdMap.get(cmd)))();
  }
  
}