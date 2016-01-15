//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import * as cryptoEx from '../../lib/cipher';
import { Socks5Options } from '../../lib/constant';

export function connect(client: net.Socket, rawData: Buffer, dst: { addr: string, port: number }, options: Socks5Options) {
  let proxySocket = net.createConnection(dst.port, dst.addr, async () => {
    console.log(`connecting: ${dst.addr}:${dst.port}`);
    
    let reply = rawData.slice(0, rawData.length);
    reply[0] = 0x05;
    reply[1] = 0x00;
    
    var encryptor = cryptoEx.createCipher(options.cipherAlgorithm, options.password);
    let cipherHandshake = encryptor.cipher;
    let iv = encryptor.iv;
    
    let pl = Number((Math.random() * 0xff).toFixed());
    let el = new Buffer([pl]);
    let pd = crypto.randomBytes(pl);
    let er = cipherHandshake.update(Buffer.concat([el, pd, reply]));
    
    await client.writeAsync(Buffer.concat([iv, er]));
    
    let decipher = cryptoEx.createDecipher(options.cipherAlgorithm, options.password, options.iv);
    let cipher = cryptoEx.createCipher(options.cipherAlgorithm, options.password, iv).cipher;
    
    // client.pipe(decipher).pipe(proxySocket);
    // proxySocket.pipe(cipher).pipe(client);
    
    client.on('data', (d: Buffer) => {
      let tmp = decipher.update(d);
      proxySocket.write(tmp);
    });
    
    proxySocket.on('data', (data: Buffer) => {
      let d = cipher.update(data);
      client.write(d);
    });
  });
  
  function dispose(err: Error) {
    if (err) console.info(err.message);
    client.dispose();
    proxySocket.dispose();
  }
  
  proxySocket.on('error', dispose);
  proxySocket.on('end', dispose);
  client.on('error', dispose);
  client.on('end', dispose);
  
  proxySocket.setTimeout(options.timeout * 1000);
  client.setTimeout(options.timeout * 1000);
}