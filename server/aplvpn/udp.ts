//-----------------------------------
// Copyright(c) 2016 Neko
//-----------------------------------

'use strict'

import * as net from 'net';
import * as dgram from 'dgram';
import * as cryptoEx from '../../common/cipher';
import { HandshakeOptions } from '../../common/constant';
import { VpnHandshake } from './index';
import * as addrHelper from '../lib/addressHelper';

export function handleUDP(client: net.Socket, handshake: VpnHandshake, options: HandshakeOptions) {
  let udpType = handshake.ipVer == IP_VER.V4 ? 'udp4' : 'udp6';
  let udpSocket = dgram.createSocket(udpType, async (msg: Buffer, rinfo: dgram.RemoteInfo) => {
    
  });
  
  let destAddress = addrHelper.ntoa(handshake.destAddress);
  udpSocket.send(handshake.extra, 0, handshake.extra.length, handshake.destPort, destAddress);
}