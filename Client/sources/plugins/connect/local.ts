//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import { IConnectExecutor, INegotiationOptions, IConnectDestinationOptions, ITransportOptions } from '../../socks5/interfaces';

export class LocalConnectExecutor implements IConnectExecutor {
  
  negotiate(options: INegotiationOptions, callback: (result: boolean, reason?: string) => void) {
    callback(true);
  }
  
  connectDestination(options: IConnectDestinationOptions, callback: (result: boolean, reason?: string) => void) {
    callback(true);
  }
  
  transport(options: ITransportOptions) {
    let proxySocket = options.proxySocket;
    let clientSocket = options.clientSocket;
    
    proxySocket.pipe(clientSocket);
    clientSocket.pipe(proxySocket);
  }
}

module.exports.createExecutor = function() {
  return new LocalConnectExecutor();
}