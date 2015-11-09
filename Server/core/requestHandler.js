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
 *    clientSocket,
 *    password,
 *    cipherAlgorithm
 * }
 */
function handleRequest(options) {
  let clientSocket = options.clientSocket;
  
  // Step1: Negotiate with client
  let negotiation = new Promise((resolve, reject) => {  
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
    
    function dispatchRequest(data) {
      let decipher = crypto.createDecipher(cipherAlgorithm, cipherKey);
      let buf = Buffer.concat([decipher.update(data), decipher.final()]);
      
      let request;
      
      try {
        request = JSON.parse(buf.toString('utf8'));
      } catch(ex) {
        clientSocket.end();
      }
      
      if (request.verificationNum !== vn) return clientSocket.end();

      let handlerOptions = {
        clientSocket,
        cipherAlgorithm,
        cipherKey
      };
      
      Object.assign(handlerOptions, request);
      
      let handlers = {
        'bind': handleBind,
        'connect': handleConnect,
        'udpAssocaite': handleUdpAssociate
      };
      
      handlers[request.type](handlerOptions);
      clientSocket.removeListener('data', dispatchRequest);
    }
    
    // Step3: Dispatch incoming requests by type
    clientSocket.on('data', dispatchRequest);
  }, (err) => {
    clientSocket.end();
  });
}

module.exports = handleRequest;