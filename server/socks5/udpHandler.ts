//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as dgram from 'dgram';
import * as crypto from 'crypto';
import * as cryptoEx from '../../lib/cipher';
import { ATYP } from '../../lib/socks5Constant';
import { ISocks5Options } from '../../lib/constant';
import * as socksHelper from '../../lib/socks5Helper';

export function udpAssociate(client: net.Socket, rawData: Buffer, dst: { addr: string, port: number }, options: ISocks5Options) {
  let udpType = 'udp' + (net.isIP(dst.addr) || 4);
  let serverUdp = dgram.createSocket(udpType);
  let ivLength: number = cryptoEx.SupportedCiphers[options.cipherAlgorithm][1];
  
  serverUdp.bind();
  serverUdp.unref();
  serverUdp.once('listening', async () => {
    let udpAddr = serverUdp.address();
    let reply = socksHelper.createSocks5TcpReply(0x0, udpAddr.family === '' ? ATYP.IPV4 : ATYP.IPV6, udpAddr.address, udpAddr.port);
    
    let encryptor = cryptoEx.createCipher(options.cipherAlgorithm, options.password);
    let cipher = encryptor.cipher;
    let iv = encryptor.iv;
    
    let pl = Number((Math.random() * 0xff).toFixed());
    let pd = crypto.randomBytes(pl);
    let el = cipher.update(new Buffer([pl]));
    let er = cipher.update(reply);
    
    await client.writeAsync(Buffer.concat([iv, el, pd, er]));
  });
  
  let udpSet = new Map<string, dgram.Socket>();
  serverUdp.on('message', async (msg: Buffer, rinfo: dgram.RemoteInfo) => {
    let iv = new Buffer(ivLength);
    msg.copy(iv, 0, 0, ivLength);
    
    let decipher = cryptoEx.createDecipher(options.cipherAlgorithm, options.password, iv);
    let cipher = cryptoEx.createCipher(options.cipherAlgorithm, options.password, iv).cipher;
    
    let el = new Buffer(1);
    msg.copy(el, 0, ivLength, ivLength + 1);
    let pl = decipher.update(el)[0];
    
    let udpMsg = new Buffer(msg.length - ivLength - 1 - pl);
    msg.copy(udpMsg, 0, ivLength + 1 + pl, msg.length);
    udpMsg = decipher.update(udpMsg);
    
    let dst = socksHelper.refineDestination(udpMsg);
    
    let socketId = `${rinfo.address}:${rinfo.port}`;
    let proxyUdp = udpSet.get(socketId) || dgram.createSocket(udpType);
    proxyUdp.unref();
    
    proxyUdp.send(udpMsg, dst.headerSize, udpMsg.length - dst.headerSize, dst.port, dst.addr);
    proxyUdp.on('message', (msg: Buffer) => {
      let data = cipher.update(msg);
      serverUdp.send(data, 0, data.length, rinfo.port, rinfo.address);
    });
    
    proxyUdp.on('error', () => { proxyUdp.removeAllListeners(); proxyUdp.close(); udpSet.delete(socketId); });
    if (!udpSet.has(socketId) ) udpSet.set(socketId, proxyUdp);
  });
  
  function dispose() {
    serverUdp.removeAllListeners();
    serverUdp.close();
    serverUdp.unref();
    
    client.dispose();
    
    udpSet.forEach(udp => {
      udp.removeAllListeners();
      udp.close();
    });
    
    udpSet.clear();
  }
  
  client.on('error', dispose);
  client.on('end', dispose);
  serverUdp.on('error', dispose);
  serverUdp.on('close', dispose);
}