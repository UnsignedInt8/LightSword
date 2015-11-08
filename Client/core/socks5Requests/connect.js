//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const os = require('os');
const net = require('net');
const crypto = require('crypto');
const socks5Helper = require('./helpers');
const socks5Const = require('../socks5Const');
const logger = require('winston');

/**
 * options: {
 *    proxySocket,
 *    cipherAlgorithm,
 *    password
 * }
 * 
 * callback: (err, cipherKey) => void
 */
function negotiateCipher(options, callback) {
  let proxySocket = options.proxySocket;
  let cipherAlgorithm = options.cipherAlgorithm;
  let password = options.password;
  
  let sha = crypto.createHash('sha256');
  sha.update((Math.random() * Date.now()).toString());
  let cipherKey = sha.digest();
  
  let verifyNum = (Math.random() * Date.now()).toFixed();
  
  let handshake = {
    cipherKey,
    verifyNum,
    randomPadding: Math.random() * Date.now()
  };
  
  proxySocket.once('data', (data) => {
    let handshakeDecipher = crypto.createDecipher(cipherAlgorithm, password);
    let buf = Buffer.concat([handshakeDecipher.update(data), handshakeDecipher.final()]);
    
    try {
      let res = JSON.parse(buf.toString('utf8'));
      if (res.okNum !== verifyNum) return callback(new Error("Can't confirm verification number"));

      callback(null, cipherKey);
    } catch(ex) {
      logger.error(ex.message);
      callback(ex);
    }
  });
  
  let handshakeCipher = crypto.createCipher(cipherAlgorithm, password);
  let hello = Buffer.concat([handshakeCipher.update(JSON.stringify(handshake)), handshakeCipher.final()]);
  proxySocket.write(hello);
}

function handleConnect(options) {

  socks5Helper.getDefaultSocks5Reply((buf) => {
    let clientSocket = options.clientSocket;
    let dstAddr = options.dstAddr;
    let dstPort = options.dstPort;
  
    let proxySocket = net.createConnection(dstPort, dstAddr, () => {
      logger.info('proxy connected');
      
      let negotiationOptions = {
        proxySocket: proxySocket,
        password: options.password,
        cipherAlgorithm: options.cipherAlgorithm
      };
      
      negotiateCipher(negotiationOptions, (err, cipherKey) => {
        buf.writeUInt16BE(dstPort, buf.byteLength - 2);
        
        if (err) {
          proxySocket.end();
          return clientSocket.end(buf);
        }
        
          buf[1] = socks5Const.REPLY_CODE.SUCCESS;
      });
      
      clientSocket.on('error', (err) => {});
      clientSocket.on('close', (hadError) => {});
      clientSocket.on('data', (data) => proxySocket.write(handshakeCipher.update(data)));
      
    });
    
    proxySocket.on('data', (data) => clientSocket.write(decipher.update(data)));
    
    proxySocket.on('error', (error) => {
      logger.error('proxy error: ' + error.code);
      
      if (this._communicating) {
        if (error.code === 'ETIMEOUT') return;
        return this.endClientSocket();
      }
      
      buf[1] = socks5Const.ErrorCode.has(error.code) ? socks5Const.ErrorCode.get(error.code) : socks5Const.REPLY_CODE.SOCKS_SERVER_FAILURE;
      this.endClientSocket(buf);
    });
    
    proxySocket.on('end', () => {
      
    });
    proxySocket.on('close', this.onProxyClose.bind(this));

    logger.info('connect: ' + dstAddr + ':' + dstPort);

  });
  
}

module.exports = handleConnect;