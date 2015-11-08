/* global it */
/* global describe */

'use strict'

require('kinq')();
const net = require('net');
const assert = require('assert');
const ipaddr = require('ipaddr.js');
const helper = require('../core/socks5Requests/helpers');

describe('Test socks5 helper', () => {
  it('should be ip addr', (done) => {
    helper.getHostIP((ip, fam) => {
      assert(net.isIP(ip) === fam);
      done();
    });
  });
    
  it('should be byte array', (done) => {
    helper.getHostIP((ip, fam) => {
      if (fam === 6) return done();
      
      let by1 = ipaddr.parse(ip).toByteArray();
      let by2 = ip.split('.').select(c => Number(c)).toArray();
      assert.deepEqual(by1, by2);
      done();
    });
  })
})