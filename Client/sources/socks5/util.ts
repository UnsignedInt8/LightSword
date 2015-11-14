//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as os from 'os';
import * as dns from 'dns';
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