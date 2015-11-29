//--------------------------------------------- 
// Copyright(c) 2015 猫王子
//--------------------------------------------- 

'use strict'
require('kinq').enable();
const net = require('net');
const util = require('util');
const crypto = require('crypto');
const assert = require('assert');

describe('ip test', () => {
  it('should be ipv6', () => {
    let bytes = Array.from(crypto.randomBytes(16));
    let addr = '';
    let ipv6 = '';
    
    for (let b of bytes) {
      addr += ('0' + b.toString(16)).substr(-2);
    }
    
    ipv6 = addr.substr(0, 4);
    for (let i = 1; i < 8; i++) {
      ipv6 = util.format('%s:%s', ipv6, addr.substr(4 * i, 4));
    }
    
    assert(net.isIPv6(ipv6));
  });
  
  it('should be bytes', () => {
    let ipv4 = '1.2.2.3';
    let ipv6 = '2378:ab31:ba73:1111:0010:8888:eeff:9920';
    let dn = 'google.com';
    
    assert(toBytes(ipv4).length === 4);
    assert(toBytes(ipv6).length === 16);
    assert(toBytes(dn).length === 10);
  });
  
  function toBytes(fullAddr) {
    
    let type = net.isIP(fullAddr);
    let addr = [];
    switch (type) {
      case 4:
        addr = fullAddr.split('.').select(s => Number.parseInt(s)).toArray();
        break;
      case 6:
        addr = fullAddr.split(':').select(s => [Number.parseInt(s.substr(0, 2), 16), Number.parseInt(s.substr(2, 2), 16)]).aggregate((c, n) => c.concat(n));
        break;
      case 0:
        fullAddr.each((c, i) => addr.push(fullAddr.charCodeAt(i)));
        break;
    }
    
    return addr;
  }
});