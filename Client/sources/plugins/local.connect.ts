//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import { ISocks5, IStreamBasicOptions, IStreamTransportOptions, ICommandOptions } from './main';

class LocalConnect implements ISocks5 {
  
  negotiate(options: IStreamBasicOptions, callback: (result: boolean, reason?: string) => void) {
    process.nextTick(() => callback(true));
  }
  
  sendCommand(options: ICommandOptions, callback: (result: boolean, reason?: string) => void) {
    process.nextTick(() => callback(true));
  }
  
  transportStream(options: IStreamTransportOptions) {
    let proxySocket = options.proxySocket;
    let clientSocket = options.clientSocket;
    
    proxySocket.pipe(clientSocket);
    clientSocket.pipe(proxySocket);
  }
  
}

module.exports = LocalConnect;