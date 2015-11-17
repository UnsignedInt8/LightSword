//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';

export interface ISocks5Options {
  cipherAlgorithm: string;
  password: string;
  clientSocket: net.Socket;
}

export enum Socks5CommandType {
  connect = 0x1,
  bind = 0x2,
  udpAssociate = 0x3
}

export interface ISocks5 {
  negotiate: (options: ISocks5Options, callback: (success: boolean, reason?: string) => void) => void;
  transport: (options: ISocks5Options) => void;
}
