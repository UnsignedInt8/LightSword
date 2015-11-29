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
  serverUdp.once('listening', async () => {
    let udpAddr = serverUdp.address();
    let reply = socksHelper.buildSocks5Reply(0x0, udpAddr.family === '' ? ATYP.IPV4 : ATYP.IPV6, udpAddr.address, udpAddr.port);
    
    let encryptor = cryptoEx.createCipher(options.cipherAlgorithm, options.password);
    cipher = encryptor.cipher;
    
    let iv = encryptor.iv;
    let pl = Number((Math.random() * 0xff).toFixed());
    let pd = crypto.randomBytes(pl);
    let el = cipher.update(new Buffer([pl]));
    let er = cipher.update(reply);
    
    await client.writeAsync(Buffer.concat([iv, el, pd, er]));
  });
  
  serverUdp.on('message', async (msg: Buffer, rinfo: dgram.RemoteInfo) => {
    let udpMsg = options.decipher.update(msg);
    let dst = socksHelper.refineDestination(msg);
    let db = new Buffer(udpMsg.length - dst.headerSize);
    udpMsg.copy(db, 0, dst.headerSize, udpMsg.length);
    
    let proxyUdp = dgram.createSocket(udpType);
    proxyUdp.send(db, 0, db.length, dst.port, dst.addr);
    proxyUdp.once('error', proxyUdp.close);
    proxyUdp.once('message', (msg: Buffer) => {
      
    });
    
    setTimeout(() => {
      proxyUdp.removeAllListeners();
      proxyUdp.close();
      proxyUdp.unref();
    }, options.timeout * 1000);
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