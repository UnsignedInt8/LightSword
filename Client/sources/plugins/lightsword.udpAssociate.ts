//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as dgram from 'dgram';
import * as crypto from 'crypto';
import * as ipaddr from 'ipaddr.js';
import * as socks5Consts from '../socks5/consts';
import * as socks5Util from '../socks5/util';
import * as logger from 'winston';
import { ISocks5, ISocks5Options, ISocks5TransportOptions } from '../socks5/plugin';
import { negotiateAsync, initSocks5Async } from './lightsword';

class LightSwordUdpAssociate implements ISocks5 {
  cipherKey: string;
  vNum: number = 0;
  proxySocket: net.Socket;
  udpSocket: dgram.Socket;
  udpType: string;
  
  async negotiate(options: ISocks5Options, callback: (success: boolean, reason?: string) => void) {
    let ip = await socks5Util.lookupHostIPAsync();
    this.udpType = 'udp' + (net.isIP(ip) || 4);
    let _this = this;
    
    this.proxySocket = net.createConnection(options.dstPort, options.dstAddr, async () => {
      let result = await negotiateAsync(_this.proxySocket, options);
      let success = result.success;
      let reason = result.reason;
      
      _this.proxySocket.removeAllListeners('error');
      _this.cipherKey = result.cipherKey;
      _this.vNum = result.vNum;
      _this = null;
      callback(success, reason);  
    });
    
    this.proxySocket.on('error', (err) => {
      _this.proxySocket.dispose();
      _this = null;
      callback(false, err.message);
    });
  }
  
  async initSocks5Proxy(options: ISocks5Options, callback: (success: boolean, reason?: string) => void) {
    let _this = this;
    let result = await initSocks5Async(this.proxySocket, options, 'udpAssociate', this.cipherKey, this.vNum);
    if (!result.success) callback(false, result.reason);
    
    let udp = dgram.createSocket(this.udpType);
    
    udp.once('error', (err) => {
      udp.removeAllListeners();
      udp.close();
      udp.unref();
      udp = null;
      callback(false, err.message);
    });
    
    udp.once('listening', () => {
      udp.removeAllListeners('error');
      _this.udpSocket = udp;
      callback(true);
    });
    
    udp.bind();
  }
   
  fillReply(reply: Buffer) {
    let addr = this.udpSocket.address();
    reply.writeUInt16BE(addr.port, reply.length - 2);
    
    logger.info(`UDP listening on: ${addr.address}:${addr.port}`);
    return reply;
  }
  
  async transport(options: ISocks5TransportOptions) {
    let _this = this;
    let clientSocket = options.clientSocket;
    let udpReplyHeader: Buffer;
    let udpReplyAddr: string;
    let udpReplyPort: number;
    
    let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
    let cipher = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
    
    this.proxySocket.on('data', (data) => {
      let reply = Buffer.concat([udpReplyHeader, decipher.update(data)]);
      _this.udpSocket.send(reply, 0, reply.length, udpReplyPort, udpReplyAddr);
    });
    
    this.proxySocket.on('error', dispose);
    this.proxySocket.on('end', dispose);
    this.proxySocket.on('close', dispose);
    
    _this.udpSocket.on('message', async (msg: Buffer, rinfo: dgram.RemoteInfo) => {
      if (msg[2] !== 0) return dispose();
      
      udpReplyAddr = rinfo.address;
      udpReplyPort = rinfo.port;
      
      // ----------------------Build Reply Header----------------------
      let replyAtyp = 0;
      let addrBuf;
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
      
      if (!addrBuf) addrBuf = ipaddr.parse(rinfo.address).toByteArray();
      
      let header = [0x0, 0x0, 0x0, replyAtyp];
      if (replyAtyp === socks5Consts.ATYP.DN) header.push(addrBuf.length);
      header = header.concat(addrBuf).concat([0x0, 0x0]);
      udpReplyHeader = new Buffer(header);
      udpReplyHeader.writeUInt16BE(rinfo.port, udpReplyHeader.length - 2);
      // -------------------------------End-------------------------------
      
      let tuple = socks5Util.refineATYP(msg);
      await _this.proxySocket.writeAsync(cipher.update(new Buffer(msg.skip(tuple.headerLength).toArray())));
    });
    
    _this.udpSocket.on('error', dispose);
    
    function dispose() {
      _this.udpSocket.removeAllListeners();
      _this.udpSocket.unref();
      _this.udpSocket.close();
      _this.udpSocket = null;
      
      _this.proxySocket.dispose();
      _this.proxySocket = null;
      
      clientSocket.dispose();
      clientSocket = null;
    }
    
    clientSocket.on('end', dispose);
    clientSocket.on('error', dispose);
    clientSocket.on('close', dispose);
  }
}

module.exports = LightSwordUdpAssociate;