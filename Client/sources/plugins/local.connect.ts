//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as logger from 'winston';
import { ISocks5, ISocks5Options, IStreamTransportOptions } from '../socks5/plugin';

class LocalConnect implements ISocks5 {
  proxySocket: net.Socket;
  
  disposeSocket(error: Error, from: any) {
    this.proxySocket.removeAllListeners();
    this.proxySocket.end();
    this.proxySocket.destroy();
    this.proxySocket = null;
  }
  
  negotiate(options: ISocks5Options, callback: (result: boolean, reason?: string) => void) {
    let _this = this;
    
    this.proxySocket = net.createConnection(options.dstPort, options.dstAddr, () => {
      logger.info(`connect: ${options.dstAddr}`);

      _this.proxySocket.removeAllListeners('error');
      _this = null;
      process.nextTick(() => callback(true));
    });
    
    this.proxySocket.on('error', (err) => callback(false, err.message));
  }
  
  sendCommand(options: ISocks5Options, callback: (result: boolean, reason?: string) => void) {
    process.nextTick(() => callback(true));
  }
  
  transport(options: IStreamTransportOptions) {
    let _this = this;
    
    let proxySocket = this.proxySocket;
    let clientSocket = options.clientSocket;
    
    proxySocket.once('end', () => _this.disposeSocket(null, 'proxy end'));
    proxySocket.on('error', (err) => _this.disposeSocket(err, 'proxy error'));
    
    proxySocket.pipe(clientSocket);
    clientSocket.pipe(proxySocket);
  }
  
}

module.exports = LocalConnect;