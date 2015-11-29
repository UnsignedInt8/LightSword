//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import { Socks5Server } from './socks5Server';
import { REQUEST_CMD } from '../../lib/socks5Constant';
import * as socks5Helper from '../../lib/socks5Helper';

export class LocalProxyServer extends Socks5Server {
  
  handleRequest(client: net.Socket, request: Buffer) {
    let dst = socks5Helper.refineDestination(request);
    
    switch (dst.cmd) {
      case REQUEST_CMD.CONNECT:
        LocalProxyServer.connectServer(client, dst, request, this.timeout);
        break;
    }
  }
  
  static connectServer(client: net.Socket, dst: { port: number, addr: string }, request: Buffer, timeout: number) {
    
    let proxySocket = net.createConnection(dst.port, dst.addr, async () => {
      let reply = new Buffer(request.length);
      request.copy(reply);
      reply[0] = 0x05;
      reply[1] = 0x00;
      
      await client.writeAsync(reply);
      
      proxySocket.pipe(client);
      client.pipe(proxySocket);
    });
    
    function dispose() {
      proxySocket.dispose();
      client.dispose();
    }
    
    proxySocket.on('end', dispose);
    proxySocket.on('error', dispose);
    client.on('end', dispose);
    client.on('error', dispose);
    
    proxySocket.setTimeout(timeout);
    client.setTimeout(timeout);
  }
  
}