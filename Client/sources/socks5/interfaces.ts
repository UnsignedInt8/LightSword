//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';

export interface IConnectOptions {
  cipherAlgorithm: string;
  password: string;
  proxySocket: net.Socket;
}

export interface INegotiationOptions extends IConnectOptions {
  dstAddr: string;
  dstPort: number;
}

export type IConnectDestinationOptions = INegotiationOptions;

export interface ITransportOptions extends IConnectOptions {
  clientSocket: net.Socket;
}

export interface IConnectExecutor {
  
  // Step 1: Negotiate with LightSword Server.
  negotiate: (options: INegotiationOptions, finishCallback: (result: boolean, reason?: string) => void) => void,
  
  // Step 2: Reply local client connection succeed.
  connectDestination: (options: IConnectDestinationOptions, finishCallback: (result: boolean, reason?: string) => void) => void,
  
  // Step 3: Transport data.
  transport: (options: ITransportOptions) => void,
}

export interface IPluginGenerator {
  createExecutor?(): IConnectExecutor;
}