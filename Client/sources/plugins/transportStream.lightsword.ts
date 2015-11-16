//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as crypto from 'crypto';
import { IStreamTransportOptions } from './main';

function transport(options: IStreamTransportOptions) {
  let proxySocket = options.proxySocket;
  let clientSocket = options.clientSocket;
  
  let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
  // proxySocket.on('data', data => clientSocket.write(decipher.update(data)));
  proxySocket.pipe(decipher).pipe(clientSocket);
  
  let cipher = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
  // clientSocket.on('data', (data) => proxySocket.write(cipher.update(data)));
  clientSocket.pipe(cipher).pipe(proxySocket);
}

module.exports = transport;