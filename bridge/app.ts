//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------

'use strict'

require('../lib/socketEx');
require('kinq').enable();
require('async-node');
import * as net from 'net';
import { defaultServerPort } from '../common/constant';

export class App {
  
  constructor(options: { dstAddr: string, dstPort?: number, localPort?: number }) {
    let dstAddr = options.dstAddr;
    let dstPort = options.dstPort || defaultServerPort;
    let localPort = options.localPort || defaultServerPort;
    
    let server = net.createServer((socket) => {
      let transitSocket = net.createConnection(dstPort, dstAddr, () => {
        socket.pipe(transitSocket);
        transitSocket.pipe(socket);
      });
      
      function dispose() {
        transitSocket.dispose();
        socket.dispose();
      }
      
      transitSocket.on('end', dispose);
      transitSocket.on('error', dispose);
      socket.on('end', dispose);
      socket.on('error', dispose);
    });
    
    server.on('error', (err) => {
      console.log(err.message);
      process.exit(1);
    });
    
    server.listen(localPort);
  }
  
}

if (!module.parent) {
  process.title = 'LightSword Bridge Debug Mode';
}