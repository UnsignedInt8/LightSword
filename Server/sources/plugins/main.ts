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
  clientSocket: net.Socket;
}

export interface ICommandOptions extends INegotiationOptions {
  data: any;
}

export interface IStreamTransportOptions extends INegotiationOptions {
  clientSocket: net.Socket;
}

export enum Socks5CommandType {
  connect = 0x1,
  bind = 0x2,
  udpAssociate = 0x3
}

export interface IPluginPivot {
  negotiate: (options: INegotiationOptions, callback: (success: boolean, reason?: string) => void) => void;
  // resolveCommandType: (options: INegotiationOptions, callback: (success: boolean, cmdType: Socks5CommandType, data: any, reason?: string) => void) => void;
  // processCommand: (options: ICommandOptions, callback: (success: boolean, reason?: string) => void) => void;
  transportStream: (options: IStreamTransportOptions) => void;
}

export class PluginPivot implements IPluginPivot {
  public negotiate: (options: INegotiationOptions, callback: (success: boolean, reason?: string) => void) => void;
  // public resolveCommandType: (options: INegotiationOptions, callback: (success: boolean, cmdType: Socks5CommandType, data:any, reason?: string) => void) => void;
  // public processCommand: (options: ICommandOptions, callback: (success: boolean, reason?: string) => void) => void;
  public transportStream: (options: IStreamTransportOptions) => void;

  constructor(plugin: string) {
    let _this = this;
    ['negotiate', 'transportStream'].forEach(n => _this[n] = require(`./${n}.${plugin}`));
  }
  
  
}