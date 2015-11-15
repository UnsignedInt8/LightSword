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
  
  transport(options: ITransportOptions, communicationEnd: () => void) {
    let proxySocket = options.proxySocket;
    let clientSocket = options.clientSocket;
    
    proxySocket.on('data', (data) => clientSocket.write(data));
    clientSocket.on('data', (data) => proxySocket.write(data));
    
    proxySocket.once('end', () => communicationEnd());
    clientSocket.once('end', () => communicationEnd());
  }
}

module.exports.createExecutor = function() {
  return new LocalConnectExecutor();
}