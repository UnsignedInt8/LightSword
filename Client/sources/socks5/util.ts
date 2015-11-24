//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as os from 'os';
import * as dns from 'dns';
import * as util from 'util';
import * as ipaddr from 'ipaddr.js';
import * as consts from './consts';

let ip;
let ipFamily;

export async function lookupHostIPAsync(): Promise<string> {
  if (ip) {
    return new Promise<string>(resolve => resolve(ip));
  }
  
  return new Promise<string>((resolve, reject) => {
    dns.lookup(os.hostname(), (err, addr, family) => {
      if (err) reject(null);
      
      ip = addr;
      ipFamily = family;
      resolve(addr);
    });
  });
}

let socks5Buf: Buffer;
export async function buildDefaultSocks5ReplyAsync(): Promise<Buffer> {
  if (socks5Buf) {
    return new Promise<Buffer>(resolve => {
      let duplicate = new Buffer(socks5Buf.length);
      socks5Buf.copy(duplicate);
      resolve(duplicate);
    });
  }
  
  await lookupHostIPAsync();
  let bndAddr = ipaddr.parse(ip).toByteArray();
  let atyp = ipFamily === 4 ? consts.ATYP.IPV4 : consts.ATYP.IPV6;
  const bytes = [0x05, 0x0, 0x0, atyp].concat(bndAddr).concat([0x0, 0x0]);
  
  socks5Buf = new Buffer(bytes);
  let duplicate = new Buffer(bytes.length);
  socks5Buf.copy(duplicate);
  return duplicate;
}

export function refineATYP(rawData: Buffer): { addr: string, port: number, addrByteLength: number, headerLength: number } {
  
  let addr = '';
  let atyp = rawData[3];
  let addrByteLength = 0;
  
  switch(atyp) {
    case consts.ATYP.DN:
      let dnLength = rawData[4];
      addrByteLength = dnLength;
      addr = rawData.toString('utf8', 5, 5 + dnLength);
      break;
      
    case consts.ATYP.IPV4:
      addrByteLength = 4;
      addr = rawData.skip(4).take(4).aggregate((c: string, n) => c.length > 1 ? c + util.format('.%d', n) : util.format('%d.%d', c, n));
      break;
      
    case consts.ATYP.IPV6: 
      addrByteLength = 16;
      let bytes = rawData.skip(4).take(16).toArray();
      for (let i = 0; i < 8; i++) {
        addr += (new Buffer(bytes.skip(i * 2).take(2).toArray()).toString('hex') + (i < 7 ? ':' : ''));
      }
      break;
      
    default:
      console.log('break default null');
      return null;
  }
  
  let portOffest = atyp === consts.ATYP.DN ? addrByteLength + 1 : addrByteLength;
  let port = rawData.readUInt16BE(4 + portOffest);
  let headerLength = 4 + portOffest + 2;
  
  return { addr, port, addrByteLength, headerLength };
}