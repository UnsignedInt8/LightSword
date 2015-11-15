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
    let proxySocket = options.proxySocket;
    let errorHandler = (error: Error) => callback(false, error.message);
    
    proxySocket.connect(options.dstPort, options.dstAddr, () => {
      proxySocket.removeListener('error', errorHandler);
      callback(true);
    });
    
    proxySocket.once('error', errorHandler);
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