//-----------------------------------
// Copyright(c) 2016 Neko
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import * as cryptoEx from '../../common/cipher';
import { VpnHandshake } from './index';
import { HandshakeOptions } from '../../common/constant';
import { IP_VER, Protocols } from './protocols';
import { SpeedStream } from '../../lib/speedstream';

export function handleTCP(client: net.Socket, handshake: VpnHandshake, options: HandshakeOptions) {
  if (handshake.flags == 0x80) {
    handleOutbound(client, handshake.destHost, handshake.destPort, handshake.extra, options);
  }
}

function handleOutbound(client: net.Socket, host: string, port: number, desiredIv: Buffer, options: HandshakeOptions) {
  
  let proxy = net.createConnection({ port, host }, async () => {
    let success = new Buffer([0x01, 0x00]);
    let randomLength = Number((Math.random() * 64).toFixed());
    let reply = Buffer.concat([success, new Buffer(randomLength)]);
    
    let cipher = cryptoEx.createCipher(options.cipherAlgorithm, options.password, desiredIv).cipher;
    await client.writeAsync(cipher.update(reply));
    let decipher = cryptoEx.createDecipher(options.cipherAlgorithm, options.password, options.iv);
    
    let speed = options.speed;
    
    let clientStream = speed > 0 ? client.pipe(new SpeedStream(speed)) : client;
    clientStream.pipe(decipher).pipe(proxy);
    
    let proxyStream = speed > 0 ? proxy.pipe(new SpeedStream(speed)) : proxy;
    proxyStream.pipe(cipher).pipe(client);
  });
  
  function dispose() {
    client.dispose();
    proxy.dispose();
  }
  
  proxy.on('error', dispose);
  proxy.on('end', dispose);
  client.on('error', dispose);
  client.on('end', dispose);
  
  proxy.setTimeout(options.timeout * 1000);
  client.setTimeout(options.timeout * 1000);
}