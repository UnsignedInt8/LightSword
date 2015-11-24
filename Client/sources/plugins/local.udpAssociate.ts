//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as dgram from 'dgram';
import * as socks5Consts from '../socks5/consts';
import * as socks5Util from '../socks5/util';
import { ISocks5, ISocks5Options, ISocks5TransportOptions } from '../socks5/plugin';

class LocalUdpAssociate implements ISocks5 {
  transitUdp: dgram.Socket;
  udpType: string;
  
  negotiate(options: ISocks5Options, callback: (result: boolean, reason?: string) => void) {
    this.udpType = 'udp' + net.isIP(options.dstAddr);
    process.nextTick(() => callback(true));
  }
  
  sendCommand(options: ISocks5Options, callback: (result: boolean, reason?: string) => void) {
    let _this = this;
    let socket = dgram.createSocket(_this.udpType);
    
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
      _this.transitUdp = socket;
      socket.removeListener('error', errorHandler);
      clearTimeout(t);
      callback(true);
    });
    
    socket.bind();
    this.transitUdp = socket;
  }
  
  fillReply(reply: Buffer) {
    let addr = this.transitUdp.address();
    reply.writeUInt16BE(addr.port, reply.length - 2);
    return reply;
  }
  
  transport(options: ISocks5TransportOptions) {
    let _this = this;
    let clientSocket = options.clientSocket;
     
    let dataSocket = dgram.createSocket(_this.udpType);
    let udpReplyHeader: Buffer;
    let udpReplyAddr: string;
    let udpReplyPort: number;
    
    dataSocket.on('message', (msg: Buffer, rinfo: dgram.RemoteInfo) => {
      let reply = Buffer.concat([udpReplyHeader, msg]);
      _this.transitUdp.send(reply, 0, reply.length, udpReplyPort, udpReplyAddr);
    });
    
    dataSocket.on('error', (err) => dispose());
    
    this.transitUdp.on('message', (msg: Buffer, rinfo: dgram.RemoteInfo) => {
      if (msg[2] !== 0) return;
      
      udpReplyAddr = rinfo.address;
      udpReplyPort = rinfo.port;
      
      // ----------------------Build Reply Header----------------------
      let replyAtyp = 0;
      switch (net.isIP(udpReplyAddr)) {
        case 0:
          replyAtyp = socks5Consts.ATYP.DN; 
          break;
        case 4:
          replyAtyp = socks5Consts.ATYP.IPV4;
          break;
        case 6:
          replyAtyp = socks5Consts.ATYP.IPV6;
          break;
      }
      
      let header = [0x0, 0x0, 0x0, replyAtyp];
      let addrBuf = new Buffer(rinfo.address);
      if (replyAtyp === socks5Consts.ATYP.DN) header.push(addrBuf.length);
      header = header.concat(addrBuf.toArray()).concat([0x0, 0x0]);
      udpReplyHeader = new Buffer(header);
      udpReplyHeader.writeUInt16BE(rinfo.port, udpReplyHeader.length - 2);
      // -------------------------------End-------------------------------
      
      let tuple = socks5Util.refineATYP(msg);
      dataSocket.send(msg, tuple.headerLength, msg.length - tuple.headerLength, tuple.port, tuple.addr);
      
    });
    
    function dispose() {
      _this.transitUdp.removeAllListeners();
      _this.transitUdp.unref();
      _this.transitUdp.close();
      _this.transitUdp = null;
      
      dataSocket.removeAllListeners();
      dataSocket.unref();
      dataSocket.close();
      dataSocket = null;
      
      clientSocket.dispose();
      clientSocket = null;
    }
    
    clientSocket.on('end', () => dispose());
    clientSocket.on('error', () => dispose());
    clientSocket.on('close', () => dispose());
  }
 
}

module.exports = LocalUdpAssociate;