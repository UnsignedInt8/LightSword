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
  let cipher: crypto.Cipher;
  
  serverUdp.bind();
  serverUdp.unref();
  serverUdp.once('listening', async () => {
    let udpAddr = serverUdp.address();
    let reply = socksHelper.createSocks5TcpReply(0x0, udpAddr.family === '' ? ATYP.IPV4 : ATYP.IPV6, udpAddr.address, udpAddr.port);
    
    let encryptor = cryptoEx.createCipher(options.cipherAlgorithm, options.password);
    cipher = encryptor.cipher;
    
    let iv = encryptor.iv;
    let pl = Number((Math.random() * 0xff).toFixed());
    let pd = crypto.randomBytes(pl);
    let el = cipher.update(new Buffer([pl]));
    let er = cipher.update(reply);
    
    await client.writeAsync(Buffer.concat([iv, el, pd, er]));
  });
  
  let udpTable = new Map<any, dgram.Socket>();
  serverUdp.on('message', async (msg: Buffer, rinfo: dgram.RemoteInfo) => {
    let udpMsg = options.decipher.update(msg);
    let dst = socksHelper.refineDestination(msg);
    
    let proxyUdp = dgram.createSocket(udpType);
    proxyUdp.unref();
    udpTable.set(dst, proxyUdp);
    
    proxyUdp.send(udpMsg, dst.headerSize, udpMsg.length - dst.headerSize, dst.port, dst.addr);
    proxyUdp.on('error', () => { proxyUdp.removeAllListeners(); proxyUdp.close(); udpTable.delete(dst); });
    proxyUdp.on('message', (msg: Buffer) => {
      let header = socksHelper.createSocks5UdpHeader(rinfo.address, rinfo.port);
      
      // serverUdp.send()
    });
    
    udpTable.set(dst, proxyUdp);
  });
  
  function dispose() {
    serverUdp.removeAllListeners();
    serverUdp.close();
    serverUdp.unref();
    
    client.dispose();
  }
  
  client.on('error', dispose);
  client.on('end', dispose);
  serverUdp.on('error', dispose);
  serverUdp.on('close', dispose);
}