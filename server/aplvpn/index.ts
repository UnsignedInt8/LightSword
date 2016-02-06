//-----------------------------------
// Copyright(c) 2016 Neko
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import { IP_VER, Protocols } from './protocols';
import * as cryptoEx from '../../common/cipher';
import * as addrHelper from '../lib/addressHelper';
import { HandshakeOptions } from '../../common/constant';
import { handleUDP } from './udp';
import { handleTCP } from './tcp';

export type VpnHandshake = {
  ipVer: IP_VER,
  payloadProtocol: Protocols,
  flags: number,
  destAddress: number[],
  destHost: string,
  destPort: number,
  extra: Buffer,
}

const SupportedIPVers = [IP_VER.V4, IP_VER.V6];
const SupportedProtocols = [Protocols.TCP, Protocols.UDP];

export async function handleAppleVPN(client: net.Socket, handshakeData: Buffer, options: HandshakeOptions): Promise<boolean> {
  if (handshakeData.length < 9) return false;
  
  let handshake: VpnHandshake = null;
  
  try {
    handshake = extractHandeshake(handshakeData);
    if (!SupportedIPVers.contains(handshake.ipVer)) return false;
    if (!SupportedProtocols.contains(handshake.payloadProtocol)) return false;
  } catch (error) {
    return false;
  }
  
  if (addrHelper.isIllegalAddress(handshake.destHost)) {
    client.dispose();
    return true;
  }
  
  if (handshake.flags === 0x00) {
    try { await handleHandshake(client, handshake, options); } catch (error) { return false; }
    return true;
  }
  
  switch(handshake.payloadProtocol) {
    case Protocols.TCP:
      handleTCP(client, handshake, options);
      return true;
    case Protocols.UDP:
      handleUDP(client, handshake, options);
      return true;
  }
  
  return false;
}

function extractHandeshake(data: Buffer): VpnHandshake {
  let ipVer = data[0];
  let payloadProtocol = data[1];
  let flags = data[2];
  
  let ipLength = ipVer == IP_VER.V4 ? 4 : 16;
  let destAddress = data.skip(3).take(ipLength).toArray();
  let destPort = data.readUInt16BE(3 + ipLength);
  let extra = data.slice(3 + ipLength + 2);
  let destHost = addrHelper.ntoa(destAddress);
  
  return { ipVer, payloadProtocol, flags, destAddress, destHost, destPort, extra }
}

async function handleHandshake(client: net.Socket, handshake: VpnHandshake, options: HandshakeOptions) {
  let cipher = cryptoEx.createCipher(options.cipherAlgorithm, options.password, handshake.extra).cipher;
  let md5 = crypto.createHash('md5').update(handshake.extra).digest();
  let randomPadding = new Buffer(Number((Math.random() * 128).toFixed()));
  await client.writeAsync(Buffer.concat([md5, randomPadding]));
}