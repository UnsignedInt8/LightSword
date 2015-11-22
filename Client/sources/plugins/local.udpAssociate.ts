//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as dgram from 'dgram';
import { ISocks5, INegotiationOptions, IStreamTransportOptions, ICommandOptions } from '../socks5/plugin';

class LocalUdpAssociate implements ISocks5 {
  proxyUdp: dgram.Socket;
  
  negotiate(options: INegotiationOptions, callback: (result: boolean, reason?: string) => void) {
    process.nextTick(() => callback(true));
  }
  
  sendCommand(options: ICommandOptions, callback: (result: boolean, reason?: string) => void) {
    let socket = dgram.createSocket('udp' + net.isIP(options.dstAddr));
    
    let t = setTimeout(callback(false, 'timeout'), 10 * 1000);
    
    let errorHandler = (err) => {
      socket.close();
      socket.unref(); 
      callback(false, err.message);
    }
    
    socket.once('error', errorHandler);
    socket.once('listening', () => {
      socket.removeListener('error', errorHandler);
      clearTimeout(t);
      callback(true);
    });
    
    socket.bind();
    this.proxyUdp = socket;
  }
  
  fillReply(reply: Buffer) {
    let addr = this.proxyUdp.address();
    
    return reply;
  }
  
  transport(options: IStreamTransportOptions) {
    let proxySocket = options.proxySocket;
    let clientSocket = options.clientSocket;
    
    
  }
 
}

module.exports = LocalUdpAssociate;