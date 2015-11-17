//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';

export interface IBasicOptions {
  cipherAlgorithm: string;
  password: string;
}

export interface INegotiationOptions extends IBasicOptions {
  proxySocket: net.Socket;
}

export interface ICommandOptions extends INegotiationOptions {
  dstAddr: string;
  dstPort: number;
}

export interface IStreamTransportOptions extends INegotiationOptions {
  clientSocket: net.Socket;
}

export interface ISocks5 {
  // Step 1: Negotiate with Server.
  negotiate: (options: INegotiationOptions, callback: (result: boolean, reason?: string) => void) => void;
  
  // Step 2: Send SOCKS5 Command to Server.
  sendCommand: (options: ICommandOptions, callback: (result: boolean, reason?: string) => void) => void;
  
  // Step 3: Transport data.
  transportStream?: (options: IStreamTransportOptions) => void;
}

export interface ISocks5Plugin {
  getConnect: () => ISocks5;
  getBind: () => ISocks5;
  getUdpAssociate: () => ISocks5;
}

export class PluginPivot implements ISocks5Plugin {
  components = new Map<string, any>();
  
  constructor(plugin: string) {
    let _this = this;
    ['connect' /* , 'bind', 'udpAssociate' */].forEach(c => _this.components.set(c, require(`./${plugin}.${c}`)));
  }
  
  getConnect(): ISocks5 {
    return new (this.components.get('connect'))();
  }
  
  getBind(): ISocks5 {
    return null;
  }
  
  getUdpAssociate(): ISocks5 {
    return null;
  }
}