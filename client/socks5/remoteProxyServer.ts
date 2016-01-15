//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------

'use strict'

import * as net from 'net';
import * as dgram from 'dgram';
import * as crypto from 'crypto';
import * as cryptoEx from '../../lib/cipher';
import { Socks5Server } from './socks5Server';
import { VPN_TYPE } from '../../lib/constant';
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
      let handshakeCipher = encryptor.cipher;
      
      let iv = encryptor.iv;
      let pl = Number((Math.random() * 0xff).toFixed());
      let et = new Buffer([VPN_TYPE.SOCKS5, pl]);
      let pa = crypto.randomBytes(pl);
      let er = Buffer.concat([handshakeCipher.update(Buffer.concat([et, pa, request])), handshakeCipher.final()]);

      await proxySocket.writeAsync(Buffer.concat([iv, er]));
      
      let data = await proxySocket.readAsync();
      if (!data) return proxySocket.dispose();
      
      let riv = data.slice(0, iv.length);
      let handshakeDecipher = cryptoEx.createDecipher(me.cipherAlgorithm, me.password, riv);
      
      let rlBuf = Buffer.concat([handshakeDecipher.update(data.slice(iv.length, data.length)), handshakeDecipher.final()]);
      let paddingSize = rlBuf[0];
      
      let reply = rlBuf.slice(1 + paddingSize, rlBuf.length);
      
      switch (req.cmd) {
        case REQUEST_CMD.CONNECT:
          console.info(`connected: ${req.addr}:${req.port}`);
          await client.writeAsync(reply);
          
          let cipher = cryptoEx.createCipher(me.cipherAlgorithm, me.password, iv).cipher;
          let decipher = cryptoEx.createDecipher(me.cipherAlgorithm, me.password, riv);
          
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
      let el = new Buffer([pl]);
      let rp = crypto.randomBytes(pl);
      let em = cipher.update(Buffer.concat([el, rp, msg]));
      
      let data = Buffer.concat([iv, em]);
      proxyUdp.send(data, 0, data.length, udpServer.port, udpServer.addr);
      
      proxyUdp.on('message', (sMsg: Buffer, sinfo: dgram.RemoteInfo) => {
        let reply = decipher.update(sMsg);
        let header = socks5Helper.createSocks5UdpHeader(cinfo.address, cinfo.port);
        let data = Buffer.concat([header, reply]);
        listeningUdp.send(data, 0, data.length, cinfo.port, cinfo.address);
      });
      
      proxyUdp.on('error', (err) => console.log(err.message));
      udpSet.add(proxyUdp);
    });
    
    function dispose() {
      listeningUdp.removeAllListeners();
      listeningUdp.close();
      listeningUdp.unref();
      
      udpSet.forEach(udp => {
        udp.close();
      });
    }
    
    client.once('error', dispose);
    client.once('end', dispose);
    listeningUdp.on('error', dispose);
    listeningUdp.on('close', dispose);
  }
}