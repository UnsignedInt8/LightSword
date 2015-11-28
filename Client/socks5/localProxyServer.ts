//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as socks5Helper from '../../lib/socks5Helper';
import { Socks5Server } from './socks5Server';

export class LocalProxyServer extends Socks5Server {
  
  connectRemoteServer(client: net.Socket, socksRequest: Buffer): net.Socket {
    let dst = socks5Helper.refineDestination(socksRequest);
    
    let proxySocket = net.createConnection(dst.port, dst.addr, async () => {
      let reply = new Buffer(socksRequest.length);
      socksRequest.copy(reply);
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
    
    return proxySocket;
  }
  
}