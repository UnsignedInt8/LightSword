//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import { ISocks5, INegotiationOptions, IStreamTransportOptions } from './main';

class LocalConnect implements ISocks5 {
  
  negotiate(options: INegotiationOptions, callback: (result: boolean, reason?: string) => void) {
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