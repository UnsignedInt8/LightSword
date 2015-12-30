//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as dgram from 'dgram';
import * as crypto from 'crypto';
import * as cryptoEx from '../../lib/cipher';
import { ATYP } from '../../lib/socks5Constant';
import { Socks5Options } from '../../lib/constant';
import * as socksHelper from '../../lib/socks5Helper';

export function udpAssociate(client: net.Socket, rawData: Buffer, dst: { addr: string, port: number }, options: Socks5Options) {
  let udpType = 'udp' + (net.isIP(dst.addr) || 4);
  let serverUdp = dgram.createSocket(udpType);
  let ivLength: number = cryptoEx.SupportedCiphers[options.cipherAlgorithm][1];
  
  serverUdp.bind();
  serverUdp.unref();
  serverUdp.once('listening', async () => {
    let udpAddr = serverUdp.address();
    let reply = socksHelper.createSocks5TcpReply(0x0, udpAddr.family === 'IPv4' ? ATYP.IPV4 : ATYP.IPV6, udpAddr.address, udpAddr.port);
    
    let encryptor = cryptoEx.createCipher(options.cipherAlgorithm, options.password);
    let cipher = encryptor.cipher;
    let iv = encryptor.iv;
    
    let pl = Number((Math.random() * 0xff).toFixed());
    let el = new Buffer([pl]);
    let pd = crypto.randomBytes(pl);
    let er = cipher.update(Buffer.concat([el, pd, reply]));
    
    await client.writeAsync(Buffer.concat([iv, er]));
  });
  
  let udpSet = new Set<dgram.Socket>();
  serverUdp.on('message', async (msg: Buffer, cinfo: dgram.RemoteInfo) => {
    let iv = new Buffer(ivLength);
    msg.copy(iv, 0, 0, ivLength);
    
    let decipher = cryptoEx.createDecipher(options.cipherAlgorithm, options.password, iv);
    let cipher = cryptoEx.createCipher(options.cipherAlgorithm, options.password, iv).cipher;
    
    let data = decipher.update(msg.slice(iv.length, msg.length));
    let pl = data[0];
    
    let udpMsg = data.slice(1 + pl, data.length);
    let dst = socksHelper.refineDestination(udpMsg);
    
    let socketId = `${cinfo.address}:${cinfo.port}`;
    let proxyUdp = dgram.createSocket(udpType);
    proxyUdp.unref();
    
    proxyUdp.send(udpMsg, dst.headerSize, udpMsg.length - dst.headerSize, dst.port, dst.addr);
    proxyUdp.on('message', (msg: Buffer, rinfo: dgram.RemoteInfo) => {
      let data = cipher.update(msg);
      proxyUdp.send(data, 0, data.length, cinfo.port, cinfo.address);
    });
    
    proxyUdp.on('error', (err: Error) => console.log(err.message));
    udpSet.add(proxyUdp);
  });
  
  function dispose() {
    serverUdp.removeAllListeners();
    serverUdp.close();
    serverUdp.unref();
    
    client.dispose();
    
    udpSet.forEach(udp => {
      udp.close();
    });
  }
  
  client.on('error', dispose);
  client.on('end', dispose);
  serverUdp.on('error', dispose);
  serverUdp.on('close', dispose);
}