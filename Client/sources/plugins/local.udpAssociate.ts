//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as dgram from 'dgram';
import { ISocks5, ISocks5Options, IStreamTransportOptions } from '../socks5/plugin';

class LocalUdpAssociate implements ISocks5 {
  proxyUdp: dgram.Socket;
  
  negotiate(options: ISocks5Options, callback: (result: boolean, reason?: string) => void) {
    process.nextTick(() => callback(true));
  }
  
  sendCommand(options: ISocks5Options, callback: (result: boolean, reason?: string) => void) {
    let _this = this;
    let socket = dgram.createSocket('udp' + net.isIP(options.dstAddr));
    
    let t = setTimeout(callback(false, 'timeout'), 10 * 1000);
    
    let errorHandler = (err) => {
      socket.removeAllListeners();
      socket.close();
      socket.unref();
      socket = null;
      callback(false, err.message);
    };
    
    socket.once('error', errorHandler);
    socket.once('listening', () => {
      _this.proxyUdp = socket;
      socket.removeListener('error', errorHandler);
      clearTimeout(t);
      callback(true);
    });
    
    socket.bind();
  }
  
  fillReply(reply: Buffer) {
    let addr = this.proxyUdp.address();
    reply.writeUInt16BE(addr.port, reply.length - 2);
    return reply;
  }
  
  transport(options: IStreamTransportOptions) {
    let clientSocket = options.clientSocket;
    
    this.proxyUdp.on('message', (msg: Buffer, rinfo: dgram.RemoteInfo) => {
      
    });
  }
 
}

module.exports = LocalUdpAssociate;