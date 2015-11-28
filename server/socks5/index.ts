//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import { REQUEST_CMD } from '../../lib/socks5Constant';
import * as socks5Helper from '../../lib/socks5Helper';
import { connect } from './connectHandler';

export function handleSocks5(client: net.Socket, data: Buffer) {
  let dst = socks5Helper.refineDestination(data);
  
  switch (dst.cmd) {
    case REQUEST_CMD.CONNECT:
      connect(client, dst.addr, dst.port);
      break;
  }
}