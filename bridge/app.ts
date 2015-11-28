//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';

export class App {
  
  constructor(options: { dstAddr: string, dstPort?: number, localPort?: number }) {
    let dstAddr = options.dstAddr;
    let dstPort = options.dstPort || 23333;
    let localPort = options.localPort || 22333;
    
    let server = net.createServer((socket) => {
      let transitSocket = net.createConnection(dstPort, dstAddr, () => {
        socket.pipe(transitSocket);
        transitSocket.pipe(socket);
      });
      
      function dispose() {
        transitSocket.removeAllListeners();
        transitSocket.end();
        transitSocket.destroy();
        
        socket.removeAllListeners();
        socket.end();
        socket.destroy();
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