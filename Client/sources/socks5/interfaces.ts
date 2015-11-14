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

export interface ITransportOptions extends IConnectOptions {
  clientSocket: net.Socket;
}

export interface IConnectExecutor {
  
  // Step 1: Negotiate with LightSword Server.
  negotiate: (options: INegotiationOptions, callback: (success: boolean) => void) => void,
  
  // Step 2: Reply local client connection succeed.
  connectDestination: (options: INegotiationOptions, success: boolean) => void,
  
  // Step 3: Transport data.
  transport: (options: ITransportOptions, communicationEnd: () => void) => void,
}