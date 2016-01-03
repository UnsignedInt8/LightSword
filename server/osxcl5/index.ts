//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import { connect } from './connectHandler';
import { OSXCl5Options } from '../../lib/constant';
import { REQUEST_CMD } from '../../lib/socks5Constant';
import * as socks5Helper from '../../lib/socks5Helper';
import { isIllegalAddress } from '../lib/addressHelper';

export function handleOSXSocks5(client: net.Socket, data: Buffer, options: OSXCl5Options): boolean {
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
      break;
      
    default:
      return false;
  }
  
  return true;
}