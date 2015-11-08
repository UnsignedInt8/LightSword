//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const os = require('os');
const net = require('net');
const util = require('util');
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
 * callback: (err, cipherKey, verificationNum) => void
 */
function negotiateCipher(options, callback) {
  let proxySocket = options.proxySocket;
  let cipherAlgorithm = options.cipherAlgorithm;
  let password = options.password;
  
  let sha = crypto.createHash('sha256');
  sha.update((Math.random() * Date.now()).toString());
  let cipherKey = sha.digest();
  
  let verificationNum = (Math.random() * Date.now()).toFixed();
  
  // Build negotiation object
  let handshake = {
    cipherKey,
    verificationNum,
    randomPadding: Math.random() * Date.now()
  };
  
  proxySocket.once('data', (data) => {
    let handshakeDecipher = crypto.createDecipher(cipherAlgorithm, password);
    let buf = Buffer.concat([handshakeDecipher.update(data), handshakeDecipher.final()]);
    
    try {
      let res = JSON.parse(buf.toString('utf8'));
      if (res.okNum !== verificationNum) return callback(new Error("Can't confirm verification number"));

      callback(null, cipherKey, res.okNum);
    } catch(ex) {
      logger.error(ex.message);
      callback(ex);
    }
  });
  
  let handshakeCipher = crypto.createCipher(cipherAlgorithm, password);
  let hello = Buffer.concat([handshakeCipher.update(JSON.stringify(handshake)), handshakeCipher.final()]);
  proxySocket.write(hello);
}

function handleCommunication(options) {
  let clientSocket = options.clientSocket;
  let proxySocket = options.proxySocket;
  let cipherAlgorithm = options.cipherAlgorithm;
  let cipherKey = options.cipherKey;
  
  let dstAddr = options.dstAddr;
  let dstPort = options.dstPort;
  let verificationNum = options.verificationNum;
  
  let cipher = crypto.createCipher(cipherAlgorithm, cipherKey);
  let decipher = crypto.createDecipher(cipherAlgorithm, cipherKey);
  
  let connect = {
    dstAddr,
    dstPort,
    verificationNum
  };
  
  let connectBuffer = cipher.update(JSON.stringify(connect));
  proxySocket.write(connectBuffer);
  
  clientSocket.on('data', (data) => proxySocket.write(cipher.update(data)));
  clientSocket.on('error', (err) => clientSocket.end());
  clientSocket.on('end', () => proxySocket.end());
  
  proxySocket.on('data', (data) => clientSocket.write(decipher.update(data)));
  proxySocket.on('error', (error) => proxySocket.end());
  proxySocket.on('end', () => clientSocket.end());
}

function socks5Connect(options) {

  socks5Helper.getDefaultSocks5Reply((buf) => {
    let clientSocket = options.clientSocket;
    let lsAddr = options.lsAddr;
    let lsPort = options.lsPort;
    
    // Step1: Connect to LightSword Server
    let proxySocket = net.createConnection(lsAddr, lsPort, () => {
      logger.info('proxy connected');
      
      let negotiationOptions = {
        proxySocket: proxySocket,
        password: options.password,
        cipherAlgorithm: options.cipherAlgorithm
      };
      
      // Step2: Negotiate cipher with LightSword Server
      let negotiation = new Promise((resolve, reject) => {
        negotiateCipher(negotiationOptions, (err, cipherKey, vn) => {
          if (err) {
            return reject(err);
          }
          resolve({ cipherKey, vn });          
        });
      });
      
      // Step3: Send dstAddr, dstPort and communicate with LightServer
      negotiation.then((secret) => {
        let connectOptions = {};
        connectOptions.dstAddr = options.dstAddr;
        connectOptions.dstPort = options.dstPort;
        connectOptions.cipherAlgorithm = options.cipherAlgorithm;
        
        connectOptions.clientSocket = clientSocket;
        connectOptions.proxySocket = proxySocket;
        connectOptions.cipherKey = secret.cipherKey;
        connectOptions.verificationNum = secret.vn;
        
        handleCommunication(connectOptions);

        // Reply client socks5 connection succeed
        buf.writeUInt16BE(options.dstPort, buf.byteLength - 2);
        buf[1] = socks5Const.REPLY_CODE.SUCCESS;
        clientSocket.write(buf);
      }, (err) => {
        logger.error(err);
        
        buf[1] = socks5Const.REPLY_CODE.SOCKS_SERVER_FAILURE;        
        proxySocket.end();
        return clientSocket.end(buf);
      });
    });
    
  });
  
}

module.exports = socks5Connect;