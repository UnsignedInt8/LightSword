//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import { Socks5Server } from './socks5Server';

export class RemoteProxyServer extends Socks5Server {
  
  connectRemoteServer(client: net.Socket, request: Buffer) {
    
  }
}