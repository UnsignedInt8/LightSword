//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';

export interface IBasicOptions {
  cipherAlgorithm: string;
  password: string;
}

export interface IStreamBasicOptions extends IBasicOptions {
  proxySocket: net.Socket;
}

export interface INegotiationOptions extends IStreamBasicOptions {
  dstAddr: string;
  dstPort: number;
}

export interface IStreamTransportOptions extends IStreamBasicOptions {
  clientSocket: net.Socket;
}

export interface ISocks5 {
  negotiate: (options: INegotiationOptions, finishCallback: (result: boolean, reason?: string) => void) => void;
  transportStream: (options: IStreamTransportOptions) => void;
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
    // , 'bind', 'udpAssociate'
    ['connect'].forEach(c => _this.components.set(c, require(`./${plugin}.${c}`)));
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