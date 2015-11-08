//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const os = require('os');
const net = require('net');
const dgram = require('dgram');
const util = require('util');
const assert = require('assert');
const ipaddr = require('ipaddr.js');
const socks5Const = require('./socks5Const');
const logger = require('winston');

class Socks5Proxy {
  
  constructor(clientSocket, username, password) {
    this._handshook = false;
    this._authenticated = false;
    this._authentication = socks5Const.AUTHENTICATION.NOAUTH;
    this._communicating = false;
    
    this._clientSocket = clientSocket;
    clientSocket.on('data', this.onClientData.bind(this));
    clientSocket.on('error', this.onClientError.bind(this));
    clientSocket.on('end', this.onClientEnd.bind(this));
    clientSocket.on('close', this.onClientClose.bind(this));
    
    this._authenticationHandlers = {};
    this._authenticationHandlers[socks5Const.AUTHENTICATION.USERPASS] = this.onClientUserPassAuthenticate.bind(this);
    
    this._requestHandlers = {};
    this._requestHandlers[socks5Const.REQUEST_CMD.CONNECT] = this.handleConnect.bind(this);
    this._requestHandlers[socks5Const.REQUEST_CMD.BIND] = this.handleBind.bind(this);
    
    this.username = username || '';
    this.password = password || '';
    this.requestTimeout = 60;
  }
  
  /**
   * authCb: (auth: boolean) => void
   */
  onClientHandshake(data, authCb) {
    let socket = this._clientSocket;
    this._handshook = true;
    
    if (data[0] !== socks5Const.SOCKS_VER.V5) {
      let res = new Buffer([0x05, 0xFF]);
      return this.endClientSocket(res);
    }
    
    let methodCount = data[1];
    let methods = data.skip(2).take(methodCount).toArray();
    
    let handshakeRes = new Buffer([0x05, 0x0]);
    if (methods.any(i => i === socks5Const.AUTHENTICATION.USERPASS)) {
      this._authentication = socks5Const.AUTHENTICATION.USERPASS;
      handshakeRes[1] = socks5Const.AUTHENTICATION.USERPASS;
      socket.write(handshakeRes);
      return authCb(false);
    } else if (methods.any(i => i === socks5Const.AUTHENTICATION.NOAUTH)) {
      socket.write(handshakeRes);
      return authCb(true);
    } else if (methods.any(i => i === socks5Const.AUTHENTICATION.GSSAPI)) {
      // TO DO: implement GSSAPI authentication
    }
    
    handshakeRes[1] = socks5Const.AUTHENTICATION.NONE;
    this.endClientSocket(handshakeRes);
  }
  
  /**
   * https://tools.ietf.org/html/rfc1929
   */
  onClientUserPassAuthenticate(data) {
    let ver = data[0];
    assert(ver === 0x1);
    
    let userLength = data[1];
    let username = data.toString('utf8', 2, 2 + userLength);
    let passLength = data[2 + userLength]
    let password = data.toString('utf8', 2 + userLength + 1, 2 + userLength + 1 + passLength);
    
    let success = username.toLowerCase() === this.username.toLowerCase() && password === this.password;
    let res = new Buffer([0x01, success ? 0x0 : 0x1]);
    this._clientSocket.write(res);
    
    this._authenticated = success;
  }
  
  onClientRequest(data) {
    if (data[0] !== socks5Const.SOCKS_VER.V5) {
      return this.endClientSocket();
    }
    
    let cmd = data[1];
    let atyp = data[3];
    let dstAddr = '';
    let dstPort = data.readUInt16BE(data.byteLength - 2);
    
    switch(atyp) {
      case socks5Const.ATYP.DN:
        let dnLength = data[4];
        dstAddr = data.toString('utf8', 5, 5 + dnLength);
        break;
        
      case socks5Const.ATYP.IPV4:
        dstAddr = data.skip(4).take(4).aggregate((c, n) => c.length > 1 ? c + util.format('.%d', n) : util.format('%d.%d', c, n));
        break;
        
      case socks5Const.ATYP.IPV6: 
        let bytes = data.skip(4).take(16).toArray();
        for (let i = 0; i < 8; i++) {
          dstAddr += (new Buffer(bytes.skip(i * 2).take(2).toArray()).toString('hex') + (i < 7 ? ':' : ''));
        }
        break;
    }
    
    let hostname = os.hostname();
    this._requestHandlers[cmd](dstAddr, dstPort, data);
  }
  
  handleBind(dstAddr, dstPort) {
    this._clientSocket.end();
  }
  
  handleUdpAssociate(dstAddr, dstPort) {
    let udpSocket = dgram.createSocket(net.isIPv6(dstAddr) ? 'udp6' : 'udp4');
    
    udpSocket.on('listening', () => {
      let addr = udpSocket.address().address;
      let port = udpSocket.address().port;
      let ip = ipaddr.parse(addr).toByteArray();
      
      let bytes = [0x05, 0x00, 0x0, net.isIPv4(addr) ? socks5Const.ATYP.IPV4 : socks5Const.ATYP.IPV6].concat(ip).concat([0x00, 0x00]);
      let res = new Buffer(bytes);
      res.writeUInt16BE(port, res.bytesLength - 2);
    });
    
    udpSocket.bind();
  }
  
  handleConnect(dstAddr, dstPort) {
    let bndAddr = new Buffer(os.hostname());
    const bytes = [0x05, 0x00, 0x00, socks5Const.ATYP.DN, bndAddr.byteLength].concat(bndAddr.toArray()).concat([0, 0]);;
      
    let reply = new Buffer(bytes);
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
  
  onProxyData(data) {
    if (!this._clientSocket) return;
    this._clientSocket.write(data);
  }
  
  onClientData(data) {
    if (!this._handshook) {
      return this.onClientHandshake(data, (auth) => this._authenticated = auth);
    }
    
    if (!this._authenticated) {
      return this._authenticationHandlers[this._authentication](data);
    }
    
    if (!this._communicating) {
      return this.onClientRequest(data);
    }
    
    if (!this._proxySocket) return;
    
    this._proxySocket.write(data);
  }
  
  onClientError(error) {
    logger.error(error.code);
    this.endProxySocket();
  }
  
  onProxyClose(hadError) {
    this._proxySocket.removeAllListeners();
    this._proxySocket = null;
    this.endClientSocket();
    
    logger.log('proxy closed ' + hadError);
  }
  
  onClientClose(hadError) {
    this._clientSocket.removeAllListeners();
    this._clientSocket = null;
    this.endProxySocket();
    
    logger.log('client closed ' + hadError);
  }
  
  onProxyEnd() {
    this.endClientSocket();
  }
  
  onClientEnd() {
    this.endProxySocket();
  }
  
  endClientSocket(data) {
    if (!this._clientSocket) return;
    this._clientSocket.end(data);
  }
  
  endProxySocket(data) {
    if (!this._proxySocket) return;
    this._proxySocket.end(data);
  }
}

module.exports = Socks5Proxy;