//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const net = require('net');
const crypto = require('crypto');

function handleConnect(options) {
  let clientSocket = options.clientSocket;
  let dstAddr = options.dstAddr;
  let dstPort = options.dstPort;
  let cipherAlgorithm = options.cipherAlgorithm;
  let cipherKey = options.cipherKey;
  
  let cipher = crypto.createCipher(cipherAlgorithm, cipherKey);
  let decipher = crypto.createDecipher(cipherAlgorithm, cipherKey);
  
  let proxySocket = net.createConnection(dstPort, dstAddr);
  
  proxySocket.on('data', (data) => clientSocket.write(cipher.update(data)));
  clientSocket.on('data', (data) => proxySocket.write(decipher.update(data)));
  
  proxySocket.on('end', () => clientSocket.end(cipher.final()));
  clientSocket.on('end', () => proxySocket.end(decipher.final()));
  
  proxySocket.on('error', () => proxySocket.end());
  clientSocket.on('error', () => clientSocket.end());
}

module.exports = handleConnect;