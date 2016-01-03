//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as os from 'os';
import * as net from 'net';
import * as util from 'util';
import { ATYP, REQUEST_CMD } from './socks5Constant';

//
// TCP
// +----+-----+-------+------+----------+----------+
// |VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
// +----+-----+-------+------+----------+----------+
// | 1  |  1  | X'00' |  1   | Variable |    2     |
// +----+-----+-------+------+----------+----------+
//
// UDP
// +----+------+------+----------+----------+----------+
// |RSV | FRAG | ATYP | DST.ADDR | DST.PORT |   DATA   |
// +----+------+------+----------+----------+----------+
// | 2  |  1   |  1   | Variable |    2     | Variable |
// +----+------+------+----------+----------+----------+
export function refineDestination(rawData: Buffer): { cmd: REQUEST_CMD, addr: string, port: number, headerSize: number } {
  if (rawData.length < 5) {
    return null;
  }
  
  let cmd = rawData[1];
  let atyp = rawData[3];
  let addr = '';
  let dnLength = 0;
  
  switch (atyp) {
    case ATYP.DN:
      dnLength = rawData[4];
      addr = rawData.toString('utf8', 5, 5 + dnLength);
      break;
      
    case ATYP.IPV4:
      dnLength = 4;
      addr = rawData.skip(4).take(4).aggregate((c: string, n) => c.length > 1 ? c + util.format('.%d', n) : util.format('%d.%d', c, n));
      break;
      
    case ATYP.IPV6:
      dnLength = 16;
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
  
  let headerSize = 4 + (atyp === ATYP.DN ? 1 : 0) + dnLength + 2;
  let port = rawData.readUInt16BE(headerSize - 2);  
  return { cmd, addr, port, headerSize};
}

// +----+-----+-------+------+----------+----------+
// |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
// +----+-----+-------+------+----------+----------+
// | 1  |  1  | X'00' |  1   | Variable |    2     |
// +----+-----+-------+------+----------+----------+
export function createSocks5TcpReply(rep: number, atyp: number, fullAddr: string, port: number): Buffer {
  let tuple = parseAddrToBytes(fullAddr);
  let type = tuple.type;
  let addr = tuple.addrBytes;
  
  let reply = [0x05, rep, 0x00, atyp];
  if (type === ATYP.DN) reply.push(addr.length);
  reply = reply.concat(addr).concat([0x00, 0x00]);
  
  let buf = new Buffer(reply);
  buf.writeUInt16BE(port, buf.length - 2);
  return buf;
}

// +----+------+------+----------+----------+----------+
// |RSV | FRAG | ATYP | DST.ADDR | DST.PORT |   DATA   |
// +----+------+------+----------+----------+----------+
// | 2  |  1   |  1   | Variable |    2     | Variable |
// +----+------+------+----------+----------+----------+
export function createSocks5UdpHeader(dstAddr: string, dstPort: number): Buffer {
  let tuple = parseAddrToBytes(dstAddr);
  let type = tuple.type;
  let addr = tuple.addrBytes;
  
  let reply = [0x0, 0x0, 0x0, type];
  if (type === ATYP.DN) reply.push(addr.length);
  reply = reply.concat(addr).concat([0x00, 0x00]);
  
  let buf = new Buffer(reply);
  buf.writeUInt16BE(dstPort, buf.length - 2);
  return buf;
}

function parseAddrToBytes(fullAddr: string): { addrBytes: number[], type: ATYP } {
  let type = net.isIP(fullAddr);
  let addrBytes = [];
  switch (type) {
    case 4:
      addrBytes = fullAddr.split('.').select(s => Number.parseInt(s)).toArray();
      break;
    case 6:
      addrBytes = fullAddr.split(':').select(s => [Number.parseInt(s.substr(0, 2), 16), Number.parseInt(s.substr(2, 2), 16)]).aggregate((c: Array<number>, n) => c.concat(n));
      break;
    case 0:
      fullAddr.each((c, i) => addrBytes.push(fullAddr.charCodeAt(i)));
      break;
  }
  
  return { addrBytes, type: type ? (type === 4 ? ATYP.IPV4 : ATYP.IPV6) : ATYP.DN }
}