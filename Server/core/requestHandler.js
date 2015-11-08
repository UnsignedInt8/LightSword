//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const net = require('net');
const crypto = require('crypto');
const winston = require('winston');
const negotiateCipher = require('./negotiateCipher');
const handleBind = require('./socks5Response/bind');
const handleConnect = require('./socks5Response/connect');
const handleUdpAssociate = require('./socks5Response/udpAssociate');

/**
 * options: {
 *    socket,
 *    password,
 *    cipherAlgorithm
 * }
 */
function handleRequest(options) {
  let clientSocket =options.socket;
  
  let negotiation = new Promise((resolve, reject) => {
    
    // Step1: Negotiate with client
    negotiateCipher(options, (err, cipherKey, vn) => {
      if (err) return reject(err);
      resolve({ cipherKey, vn });
    });
  });
  
  // Step2: Waiting for requests
  negotiation.then((values) => {
    let cipherAlgorithm = options.cipherAlgorithm;
    let cipherKey = values.cipherKey;
    let vn = values.vn;
    
    clientSocket.once('data', (data) => {
      let decipher = crypto.createDecipher(cipherAlgorithm, cipherKey);
      let buf = Buffer.concat([decipher.update(data), decipher.final()]);
      
      try {
        let request = JSON.parse(buf.toString('utf8'));
        if (request.verification !== vn) return clientSocket.end();
        
        let handlerOptions = {
          clientSocket,
          request
        };
        
        let handlers = {
          'bind': handleBind,
          'connect': handleConnect,
          'udpAssocaite': handleUdpAssociate
        };
        
        handlers[request.type](handlerOptions);
      } catch(ex) {
        clientSocket.end();
      }
    })
  }, (err) => {
    clientSocket.end();
  });
}

module.exports = handleRequest;