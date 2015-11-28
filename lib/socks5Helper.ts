//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as os from 'os';
import * as dns from 'dns';
import * as util from 'util';
import { ATYP, REQUEST_CMD } from './socks5Constant';

// +----+-----+-------+------+----------+----------+
// |VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
// +----+-----+-------+------+----------+----------+
// | 1  |  1  | X'00' |  1   | Variable |    2     |
// +----+-----+-------+------+----------+----------+
export function refineDestination(rawData: Buffer): { cmd: REQUEST_CMD, addr: string, port: number } {
  let cmd = rawData[1];
  let atyp = rawData[3];
  let port = rawData.readUInt16BE(rawData.length - 2);
  let addr = '';
  
  switch (atyp) {
    case ATYP.DN:
      let dnLength = rawData[4];
      addr = rawData.toString('utf8', 5, 5 + dnLength);
      break;
      
    case ATYP.IPV4:
      addr = rawData.skip(4).take(4).aggregate((c: string, n) => c.length > 1 ? c + util.format('.%d', n) : util.format('%d.%d', c, n));
      break;
      
    case ATYP.IPV6:
      let bytes = rawData.skip(4).take(16).toArray();
      let ipv6 = '';
      
      for (let b of bytes) {
        ipv6 += ('0' + b.toString(16)).substr(-2);
      }
      
      addr = ipv6.substr(0, 4);
      for (let i = 1; i < 8; i++) {
        addr = util.format('%s:%s', addr, ipv6.substr(4 * i, 4));
      }
      
      break;
  }
  
  return { cmd, addr, port };
}
