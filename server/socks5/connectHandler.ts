//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import { ISocks5Options } from './index';
import * as cryptoEx from '../../lib/cipher';

// +------+------+----------+-------+
// | IV   | PLEN | RPADDING | REPLY |
// +------+------+----------+-------+
// | 8-16 | 1    | 0-255    | VAR   |
// +------+------+----------+-------+
export function connect(client: net.Socket, rawData: Buffer, dst: { addr: string, port: number }, options: ISocks5Options) {
  let proxySocket = net.createConnection(dst.port, dst.addr, async () => {
    let reply = new Buffer(rawData.length);
    rawData.copy(reply, 0, 0, rawData.length);
    reply[0] = 0x05;
    reply[1] = 0x00;
    
    let encryptor = cryptoEx.createCipher(options.cipherAlgorithm, options.password);
    let cipher = encryptor.cipher;
    let iv = encryptor.iv;
    
    let pl = Number((Math.random() * 0xff).toFixed());
    let el = cipher.update(new Buffer([pl]));
    let pd = crypto.randomBytes(pl);
    let er = cipher.update(reply);
    
    await client.writeAsync(Buffer.concat([iv, el, pd, er]));
    client.pipe(options.decipher).pipe(proxySocket);
    proxySocket.pipe(cipher).pipe(client);
  });
  
  function dispose() {
    client.dispose();
    proxySocket.dispose();
  }
  
  proxySocket.on('error', dispose);
  proxySocket.on('end', dispose);
  client.on('error', dispose);
  client.on('end', dispose);
}