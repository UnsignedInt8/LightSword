//--------------------------------------------- 
// Copyright(c) 2015 猫王子
//--------------------------------------------- 

'use strict'
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
});