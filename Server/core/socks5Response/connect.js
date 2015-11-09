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
    let cipherOnce = crypto.createCipher(cipherAlgorithm, cipherKey);
    let conncetOk = { msg: 'connect ok', verificationNum: Number(options.verificationNum) + 1 };
    clientSocket.write(Buffer.concat([cipherOnce.update(JSON.stringify(conncetOk)), cipherOnce.final()]));
    
    let cipher = crypto.createCipher(cipherAlgorithm, cipherKey);
    proxySocket.on('data', (data) => {
      clientSocket.write(cipher.update(data));
    });
    
    let decipher = crypto.createDecipher(cipherAlgorithm, cipherKey);
    clientSocket.on('data', (data) => {
      proxySocket.write(decipher.update(data));
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