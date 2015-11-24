//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as logger from 'winston';
import { ISocks5, ISocks5Options, ISocks5TransportOptions } from '../socks5/plugin';

class LocalConnect implements ISocks5 {
  proxySocket: net.Socket;
 
  negotiate(options: ISocks5Options, callback: (result: boolean, reason?: string) => void) {
    let _this = this;
    
    this.proxySocket = net.createConnection(options.dstPort, options.dstAddr, () => {
      logger.info(`connect: ${options.dstAddr}`);

      _this.proxySocket.removeAllListeners('error');
      _this = null;
      process.nextTick(() => callback(true));
    });
    
    this.proxySocket.on('error', (err) => {
      _this.proxySocket.dispose();
      _this = null;
      callback(false, err.message)
    });
  }
  
  sendCommand(options: ISocks5Options, callback: (result: boolean, reason?: string) => void) {
    process.nextTick(() => callback(true));
  }
  
  transport(options: ISocks5TransportOptions) {
    let _this = this;
    
    let proxySocket = this.proxySocket;
    let clientSocket = options.clientSocket;
    
    function disposeSocket() {
      proxySocket.dispose();
      clientSocket.dispose();
      _this = null;
    }
    
    proxySocket.once('end', () => disposeSocket());
    proxySocket.on('error', (err) => disposeSocket());
    clientSocket.once('end', () => disposeSocket());
    clientSocket.on('error', (err) => disposeSocket());
    
    proxySocket.pipe(clientSocket);
    clientSocket.pipe(proxySocket);
  }
  
}

module.exports = LocalConnect;