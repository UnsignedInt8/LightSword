//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as dgram from 'dgram';
import * as logger from 'winston';
import * as socks5Consts from '../socks5/consts';
import * as socks5Util from '../socks5/util';
import * as ipaddr from 'ipaddr.js';
import { ISocks5, ISocks5Options, ISocks5TransportOptions } from '../socks5/plugin';

class LocalUdpAssociate implements ISocks5 {
  transitUdp: dgram.Socket;
  udpType: string;
  
  negotiate(options: ISocks5Options, callback: (result: boolean, reason?: string) => void) {
    this.udpType = 'udp' + (net.isIP(options.dstAddr) || 4);
    process.nextTick(() => callback(true));
  }
  
  sendCommand(options: ISocks5Options, callback: (result: boolean, reason?: string) => void) {
    let _this = this;
    let socket = dgram.createSocket(_this.udpType);
    
    let errorHandler = (err) => {
      socket.removeAllListeners();
      socket.close();
      socket.unref();
      socket = null;
      callback(false, err.message);
    };
    
    socket.once('error', errorHandler);
    socket.on('listening', () => {
      socket.removeListener('error', errorHandler);
      _this.transitUdp = socket;
      callback(true);
    });
    
    socket.bind();
  }
  
  fillReply(reply: Buffer) {
    let addr = this.transitUdp.address();
    reply.writeUInt16BE(addr.port, reply.length - 2);
    
    logger.info(`UDP listening on: ${addr.address}:${addr.port}`);
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
    
    _this.transitUdp.on('message', (msg: Buffer, rinfo: dgram.RemoteInfo) => {
      if (msg[2] !== 0) return dispose();
      
      udpReplyAddr = rinfo.address;
      udpReplyPort = rinfo.port;
      
      // ----------------------Build Reply Header----------------------
      let replyAtyp = 0;
      let addrBuf = ipaddr.parse(rinfo.address).toByteArray();
      switch (net.isIP(udpReplyAddr)) {
        case 0:
          replyAtyp = socks5Consts.ATYP.DN; 
          addrBuf = new Buffer(rinfo.address).toArray();
          break;
        case 4:
          replyAtyp = socks5Consts.ATYP.IPV4;
          break;
        case 6:
          replyAtyp = socks5Consts.ATYP.IPV6;
          break;
      }
      
      let header = [0x0, 0x0, 0x0, replyAtyp];
      if (replyAtyp === socks5Consts.ATYP.DN) header.push(addrBuf.length);
      header = header.concat(addrBuf).concat([0x0, 0x0]);
      udpReplyHeader = new Buffer(header);
      udpReplyHeader.writeUInt16BE(rinfo.port, udpReplyHeader.length - 2);
      // -------------------------------End-------------------------------
      
      let tuple = socks5Util.refineATYP(msg);
      dataSocket.send(msg, tuple.headerLength, msg.length - tuple.headerLength, tuple.port, tuple.addr);
      
    });
    
    function dispose() {
      console.log('udp dispose');
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