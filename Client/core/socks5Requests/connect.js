//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const os = require('os');
const net = require('net');
const socks5Const = require('../socks5Const');
const logger = require('winston');

function initReply() {
  let bndAddr = new Buffer(os.hostname());
  const bytes = [0x05, 0x00, 0x00, socks5Const.ATYP.DN, bndAddr.byteLength].concat(bndAddr.toArray()).concat([0, 0]);;
  let reply = new Buffer(bytes);
  
  return {
    getDefaultReply() {
      return reply;
    }
  } 
}

let res = initReply();

function handleConnect(clientSocket, dstAddr, dstPort) {

    let reply = res.getDefaultReply();
    reply.writeUInt16BE(dstPort, reply.byteLength - 2);
    
    logger.info('connect: ' + dstAddr + ':' + dstPort);
    
    let proxySocket = net.createConnection(dstPort, dstAddr, () => {
      logger.info('proxy connected');
      if (!this._clientSocket) return;
      
      reply[1] = socks5Const.REPLY_CODE.SUCCESS;
      this._communicating = true;
      this._clientSocket.write(reply);
    });
    
    proxySocket.setTimeout(this.requestTimeout * 1000);
    
    proxySocket.on('data', this.onProxyData.bind(this));
    
    proxySocket.on('error', (error) => {
      logger.error('proxy error: ' + error.code);
      
      if (this._communicating) {
        if (error.code === 'ETIMEOUT') return;
        return this.endClientSocket();
      }
      
      reply[1] = socks5Const.ErrorCode.has(error.code) ? socks5Const.ErrorCode.get(error.code) : socks5Const.REPLY_CODE.SOCKS_SERVER_FAILURE;
      this.endClientSocket(reply);
    });
    
    proxySocket.on('timeout', () => {
      logger.warn('proxy timeout: ' + dstAddr);
      
      if (this._communicating) return;
      
      reply[1] = socks5Const.REPLY_CODE.TTL_EXPIRED;
      this.endClientSocket(reply);
    });
    
    proxySocket.on('end', this.onProxyEnd.bind(this));
    proxySocket.on('close', this.onProxyClose.bind(this));
    
    this._proxySocket = proxySocket;
}

module.exports = handleConnect;