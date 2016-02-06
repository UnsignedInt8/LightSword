//-----------------------------------
// Copyright(c) 2016 Neko
//-----------------------------------

'use strict'

import * as net from 'net';
import * as dgram from 'dgram';
import * as crypto from 'crypto';
import * as cryptoEx from '../../common/cipher';
import { HandshakeOptions } from '../../common/constant';
import { VpnHandshake } from './index';
import { IP_VER } from './protocols';
import * as addrHelper from '../lib/addressHelper';

export function handleUDP(client: net.Socket, handshake: VpnHandshake, options: HandshakeOptions) {
  let communicationPending = false;
  let udpType = handshake.ipVer == IP_VER.V4 ? 'udp4' : 'udp6';
  let destAddress = addrHelper.ntoa(handshake.destAddress);
  let decipher: crypto.Decipher = null;
  
  let udpSocket = dgram.createSocket(udpType, async (msg: Buffer, rinfo: dgram.RemoteInfo) => {
    let iv = crypto.randomBytes(options.ivLength);
    let cipher = cryptoEx.createCipher(options.cipherAlgorithm, options.password, iv).cipher;
    let len = new Buffer(2);
    len.writeUInt16LE(msg.length, 0);
    let encrypted = cipher.update(Buffer.concat([len, msg]));
    await client.writeAsync(Buffer.concat([iv, encrypted]));
    disposeResource();
  });
  
  udpSocket.on('error', () => disposeResource());
  udpSocket.send(handshake.extra, 0, handshake.extra.length, handshake.destPort, destAddress);
  
  function disposeResource() {
    clearInterval(cleanTimer);
    client.dispose();
    udpSocket.close();
    udpSocket.removeAllListeners();
  }
  
  let cleanTimer = setInterval(() => {
    if (communicationPending) {
      communicationPending = false;
      return;
    }
    
    disposeResource();
  }, 30 * 1000);
  
  client.on('error', () => disposeResource());
}