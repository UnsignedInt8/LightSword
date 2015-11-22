//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as os from 'os';

export class IpHelper {
  static isLocalAddress(addr: String): boolean {
    let localIps = ['127.0.0.1', 'localhost', '192.168.', '10.', '::1', '172.16.', os.hostname()];
    return localIps.any(a => addr.toLowerCase().startsWith(a));
  }
}