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
const handleConnect = require('./socks5Requests/connect');
const handleBind = require('./socks5Requests/bind')
const handleUdpAssociate = require('./socks5Requests/udpAssociate');

function handleHandshake(data) {
  
  if (data[0] !== socks5Const.SOCKS_VER.V5) {
    return socks5Const.AUTHENTICATION.NONE;
  }
  
  let methodCount = data[1];
  let methods = data.skip(2).take(methodCount).toArray();
  
  if (methods.any(i => i === socks5Const.AUTHENTICATION.USERPASS)) {
    return socks5Const.AUTHENTICATION.USERPASS;
  } else if (methods.any(i => i === socks5Const.AUTHENTICATION.NOAUTH)) {
    return socks5Const.AUTHENTICATION.NOAUTH;
  } else if (methods.any(i => i === socks5Const.AUTHENTICATION.GSSAPI)) {
    // TO DO: implement GSSAPI authentication
  }
  
  return socks5Const.AUTHENTICATION.NONE;
}

/**
  * https://tools.ietf.org/html/rfc1929
  */
function handleAuthenication(data, socks5Username, socks5Password) {
  let ver = data[0];
  assert(ver === 0x1);
  
  let userLength = data[1];
  let username = data.toString('utf8', 2, 2 + userLength);
  let passLength = data[2 + userLength]
  let password = data.toString('utf8', 2 + userLength + 1, 2 + userLength + 1 + passLength);
  
  return username.toLowerCase() === socks5Username.toLowerCase() && password === socks5Password; 
}

function refineRequest(data) {
  if (data[0] !== socks5Const.SOCKS_VER.V5) {
    return null;
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
  
  return { cmd, dstAddr, dstPort };
}

function handleRequest(clientSocket, options) {
  let handshook = false;
  let authenticated = false;
  let authentication = socks5Const.AUTHENTICATION.NOAUTH;
  
  let authenticationHandlers = {};
  authenticationHandlers[socks5Const.AUTHENTICATION.USERPASS] = handleAuthenication;
  
  let requestHandlers = {};
  requestHandlers[socks5Const.REQUEST_CMD.CONNECT] = handleConnect;
  requestHandlers[socks5Const.REQUEST_CMD.BIND] = handleBind;
  requestHandlers[socks5Const.REQUEST_CMD.UDP_ASSOCIATE] = handleUdpAssociate;
  
  let socks5Username = options.socks5Username || '';
  let socks5Password = options.socks5Password || '';
  
  function hello(data) {
    if (!handshook) {
      handshook = true;
      authentication = handleHandshake(data);
      authenticated = authentication === socks5Const.AUTHENTICATION.NOAUTH;
      let res = new Buffer([socks5Const.SOCKS_VER.V5, authentication]);
      return clientSocket.write(res);
    }
    
    if (!authenticated) {
      authenticated = true;
      let success = authenticationHandlers[authentication](data, socks5Username, socks5Password);
      let res = new Buffer([0x01, success ? 0x0 : 0x1]);
      return clientSocket.write(res);
    }
    
    let request = refineRequest(data);
    if (!request) return clientSocket.end();
    
    let handleOptions = {
      dstAddr: request.dstAddr,
      dstPort: request.dstPort,
      clientSocket
    };
    
    Object.assign(handleOptions, options); 
    requestHandlers[request.cmd](handleOptions, data);
    clientSocket.removeListener('data', hello);
  }
  
  clientSocket.on('data', hello);

}

module.exports = handleRequest;