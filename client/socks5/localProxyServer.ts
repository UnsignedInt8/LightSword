//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as dgram from 'dgram';
import { Socks5Server } from './socks5Server';
import { REQUEST_CMD, ATYP } from '../../lib/socks5Constant';
import * as socks5Helper from '../../lib/socks5Helper';

export class LocalProxyServer extends Socks5Server {
  
  handleRequest(client: net.Socket, request: Buffer): boolean {
    let dst = socks5Helper.refineDestination(request);
    
    switch (dst.cmd) {
      case REQUEST_CMD.CONNECT:
        LocalProxyServer.connectServer(client, dst, request, this.timeout);
        break;
      case REQUEST_CMD.UDP_ASSOCIATE:
        LocalProxyServer.udpAssociate(client, dst);
        break;
      default:
        return false;
    }
    
    return true;
  }
  
  static bind(client, dst: { port: number, addr: string }) {
    
  }
  
  static udpAssociate(client: net.Socket, dst: { port: number, addr: string }) {
    let udpType = 'udp' + (net.isIP(dst.addr) || 4);
    let serverUdp = dgram.createSocket(udpType);
    serverUdp.bind();
    serverUdp.unref();
    serverUdp.on('listening', async () => {
      let udpAddr = serverUdp.address();
      let reply = socks5Helper.createSocks5TcpReply(0x0, udpAddr.family === 'IPv4' ? ATYP.IPV4 : ATYP.IPV6, udpAddr.address, udpAddr.port);
      await client.writeAsync(reply);
    });
    
    let udpSet = new Map<string, dgram.Socket>();
    serverUdp.on('message', (msg: Buffer, rinfo: dgram.RemoteInfo) => {
      let socketId = `${rinfo.address}:${rinfo.port}`;
      let dst = socks5Helper.refineDestination(msg);
      
      let proxyUdp = udpSet.get(socketId) || dgram.createSocket(udpType);
      proxyUdp.unref();
      
      proxyUdp.send(msg, dst.headerSize, msg.length - dst.headerSize, dst.port, dst.addr);
      proxyUdp.on('message', (msg: Buffer) => {
        let header = socks5Helper.createSocks5UdpHeader(rinfo.address, rinfo.port);
        let data = Buffer.concat([header, msg]);
        serverUdp.send(data, 0, data.length, rinfo.port, rinfo.address);
      });
      
      proxyUdp.on('error', () => { proxyUdp.removeAllListeners(); proxyUdp.close(); udpSet.delete(socketId); })
      if (!udpSet.has(socketId)) udpSet.set(socketId, proxyUdp);
    });
    
    function dispose() {
      client.dispose();
      
      serverUdp.removeAllListeners();
      serverUdp.close();
      
      udpSet.forEach(udp => {
        udp.removeAllListeners();
        udp.close();
      });
      
      udpSet.clear();
    }
    
    serverUdp.on('error', dispose);
    client.on('error', dispose);
    client.on('end', dispose);
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