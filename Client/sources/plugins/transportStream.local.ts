//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import {IStreamTransportOptions} from './main';

function transport(options: IStreamTransportOptions) {
  let proxySocket = options.proxySocket;
  let clientSocket = options.clientSocket;
  
  proxySocket.pipe(clientSocket);
  clientSocket.pipe(proxySocket);
}

module.exports = transport;