//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import { connect } from './connectHandler';
import { REQUEST_CMD } from '../../lib/socks5Constant';
import * as socks5Helper from '../../lib/socks5Helper';

export type ISocks5Options = {
  decipher: crypto.Decipher,
  password: string,
  cipherAlgorithm: string
}

export function handleSocks5(client: net.Socket, data: Buffer, options: ISocks5Options) {
  let dst = socks5Helper.refineDestination(data);
  
  switch (dst.cmd) {
    case REQUEST_CMD.CONNECT:
      connect(client, data, dst, options);
      break;
  }
}