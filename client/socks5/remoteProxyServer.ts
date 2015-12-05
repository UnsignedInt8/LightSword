//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as dgram from 'dgram';
import * as crypto from 'crypto';
import * as cryptoEx from '../../lib/cipher';
import { VPN_TYPE } from '../../lib/constant';
import { Socks5Server } from './socks5Server';
import { LocalProxyServer } from './localProxyServer';
import * as socks5Helper from '../../lib/socks5Helper';
import { REQUEST_CMD, ATYP } from '../../lib/socks5Constant';

export class RemoteProxyServer extends Socks5Server {
  
  handleRequest(client: net.Socket, request: Buffer) {
    let me = this;
    
    let req = socks5Helper.refineDestination(request);
    if (this.localArea.any((a: string) => req.addr.toLowerCase().startsWith(a)) && this.bypassLocal) {
      if (req.cmd === REQUEST_CMD.CONNECT) return LocalProxyServer.connectServer(client, { addr: req.addr, port: req.port }, request, this.timeout);
      if (req.cmd === REQUEST_CMD.UDP_ASSOCIATE) return LocalProxyServer.udpAssociate(client, { addr: req.addr, port: req.port });
    }
    
    let proxySocket = net.createConnection(this.serverPort, this.serverAddr, async () => {
      let encryptor = cryptoEx.createCipher(me.cipherAlgorithm, me.password);
      let cipher = encryptor.cipher;
      
      let iv = encryptor.iv;
      let pl = Number((Math.random() * 0xff).toFixed());
      let et = cipher.update(new Buffer([VPN_TYPE.SOCKS5, pl]));
      let pa = crypto.randomBytes(pl);
      let er = cipher.update(request);

      await proxySocket.writeAsync(Buffer.concat([iv, et, pa, er]));
      
      let data = await proxySocket.readAsync();
      if (!data) return proxySocket.dispose();
      
      let riv = new Buffer(iv.length);
      data.copy(riv, 0, 0, iv.length);
      let decipher = cryptoEx.createDecipher(me.cipherAlgorithm, me.password, riv);
      
      let rlBuf = new Buffer(1);
      data.copy(rlBuf, 0, iv.length, iv.length + 1);
      let paddingSize = decipher.update(rlBuf)[0];
      
      let reBuf = new Buffer(data.length - iv.length - 1 - paddingSize);
      data.copy(reBuf, 0, iv.length + 1 + paddingSize, data.length);
      let reply = decipher.update(reBuf);
      
      switch (req.cmd) {
        case REQUEST_CMD.CONNECT:
          console.info(`connected: ${req.addr}:${req.port}`);
          await client.writeAsync(reply);
          client.pipe(cipher).pipe(proxySocket);
          proxySocket.pipe(decipher).pipe(client);
          break;
        case REQUEST_CMD.UDP_ASSOCIATE:
          let udpReply = socks5Helper.refineDestination(reply);
          me.udpAssociate(client, { addr: udpReply.addr, port: udpReply.port }, me.cipherAlgorithm, me.password);
          break;
      }
    });
    
    function dispose(err: Error) {
      if (err) console.info(err.message);
      client.dispose();
      proxySocket.dispose();
    }
    
    proxySocket.on('end', () => dispose);
    proxySocket.on('error', () => dispose);
    client.on('end', () => dispose);
    client.on('error', () => dispose);
    
    proxySocket.setTimeout(this.timeout);
  }
  
  udpAssociate(client: net.Socket, udpServer: { addr: string, port: number }, cipherAlgorithm: string, password: string) {
    let udpType = 'udp' + (net.isIP(udpServer.addr) || 4);
    let listeningUdp = dgram.createSocket(udpType);
    
    listeningUdp.bind();
    listeningUdp.unref();
    listeningUdp.once('listening', async () => {
      let udpAddr = listeningUdp.address();
      let reply = socks5Helper.createSocks5TcpReply(0x0, udpAddr.family === 'IPv4' ? ATYP.IPV4 : ATYP.IPV6, udpAddr.address, udpAddr.port);
      await client.writeAsync(reply);
    });
    
    let udpSet = new Set<dgram.Socket>();
    listeningUdp.on('message', async (msg: Buffer, cinfo: dgram.RemoteInfo) => {
      
      let proxyUdp = dgram.createSocket(udpType);
      proxyUdp.unref();
      
      let encryptor = cryptoEx.createCipher(cipherAlgorithm, password);
      let cipher = encryptor.cipher;
      let iv = encryptor.iv;
      let decipher = cryptoEx.createDecipher(cipherAlgorithm, password, iv);
      
      let pl = Number((Math.random() * 0xff).toFixed());
      let rp = crypto.randomBytes(pl);
      let el = cipher.update(new Buffer([pl]));
      let em = cipher.update(msg);
      
      let data = Buffer.concat([iv, el, rp, em]);
      proxyUdp.send(data, 0, data.length, udpServer.port, udpServer.addr);
      
      proxyUdp.on('message', (sMsg: Buffer, sinfo: dgram.RemoteInfo) => {
        let reply = decipher.update(sMsg);
        let header = socks5Helper.createSocks5UdpHeader(cinfo.address, cinfo.port);
        let data = Buffer.concat([header, reply]);
        listeningUdp.send(data, 0, data.length, cinfo.port, cinfo.address);
      });
      
      proxyUdp.on('error', () => { proxyUdp.removeAllListeners(); proxyUdp.close(); udpSet.delete(proxyUdp); })
      udpSet.add(proxyUdp);
    });
    
    function dispose() {
      listeningUdp.removeAllListeners();
      listeningUdp.close();
      listeningUdp.unref();
      
      udpSet.forEach(udp => {
        udp.removeAllListeners();
        udp.close();
      });
      
      udpSet.clear();
    }
    
    client.once('error', dispose);
    client.once('end', dispose);
    listeningUdp.on('error', dispose);
    listeningUdp.on('close', dispose);
  }
}