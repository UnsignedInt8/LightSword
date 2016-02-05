//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------

'use strict'

import * as net from 'net';
import { connect } from './connectHandler';
import { udpAssociate } from './udpHandler';
import { HandshakeOptions } from '../../common/constant';
import { REQUEST_CMD } from '../../common/socks5constant';
import * as socks5Helper from '../../common/socks5helper';
import { isIllegalAddress } from '../lib/addressHelper';

export function handleSocks5(client: net.Socket, data: Buffer, options: HandshakeOptions): boolean {
  let dst = socks5Helper.refineDestination(data);
  
  if (!dst) return false;
  
  if (isIllegalAddress(dst.addr)) {
    client.dispose();
    return true;
  }
  
  switch (dst.cmd) {
    case REQUEST_CMD.CONNECT:
      connect(client, data, dst, options);
      break;
    case REQUEST_CMD.BIND:
      break;
    case REQUEST_CMD.UDP_ASSOCIATE:
      udpAssociate(client, data, dst, options);
      break;
    default:
      return false;
  }
  
  return true;
}