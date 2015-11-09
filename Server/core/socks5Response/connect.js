//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const net = require('net');
const crypto = require('crypto');
const logger = require('winston');

function handleConnect(options) {
  let clientSocket = options.clientSocket;
  let dstAddr = options.dstAddr;
  let dstPort = options.dstPort;
  let cipherAlgorithm = options.cipherAlgorithm;
  let cipherKey = options.cipherKey;
  
  let proxySocket = net.createConnection(dstPort, dstAddr, () => {
    logger.info('Server connected to %s:%d', dstAddr, dstPort);
    let cipher = crypto.createCipher(cipherAlgorithm, cipherKey);
    clientSocket.write(Buffer.concat([cipher.update('connect ok'), cipher.final()]));
    
    proxySocket.on('data', (data) => {
      // let cipher = crypto.createCipher(cipherAlgorithm, cipherKey);
      // clientSocket.write(Buffer.concat([cipher.update(data), cipher.final()]));
      logger.info('Server received: ' + data.length);
      clientSocket.write(data);
    });
    
    clientSocket.on('data', (data) => {
      // let decipher = crypto.createDecipher(cipherAlgorithm, cipherKey);
      // proxySocket.write(Buffer.concat([decipher.update(data), decipher.final()]));
      logger.info('Server from client: ' + data.length + data);
      proxySocket.write(data);
    });
    
    proxySocket.on('end', () => clientSocket.end());
    clientSocket.on('end', () => proxySocket.end());
    
  });

  proxySocket.on('error', (error) => {
    logger.error('Server error ', error);
    clientSocket.end();
  });
  
  clientSocket.on('error', () => proxySocket.end());
}

module.exports = handleConnect;