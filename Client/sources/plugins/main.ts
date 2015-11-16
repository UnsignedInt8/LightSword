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

export interface IPluginPivot {
  negotiate: (options: INegotiationOptions, finishCallback: (result: boolean, reason?: string) => void) => void;
  transportStream: (options: IStreamTransportOptions) => void;
}

export class PluginPivot implements IPluginPivot {
  public negotiate: (options: INegotiationOptions, finishCallback: (result: boolean, reason?: string) => void) => void;
  public transportStream: (options: IStreamTransportOptions) => void;

  constructor(plugin: string) {
    let _this = this;
    ['negotiate', 'transportStream'].forEach(n => _this[n] = require(`./${n}.${plugin}`));
  }
}