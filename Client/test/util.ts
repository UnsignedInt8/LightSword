'use strict'

import * as assert from 'assert'
import * as util from '../sources/socks5/util';
import { IpHelper } from '../sources/lib/ipHelper';

describe('test util', () => {
  it('lookup host ip', async (done) => {
    let ip = await util.lookupHostIPAsync();
    assert(ip.length > 0);
    assert(ip.startsWith('192.168'));
    done();
  });
  
  it('socks5 default response', async (done) => {
    let buf = await util.buildDefaultSocks5ReplyAsync();
    assert(buf.length > 0);
    assert(buf[0] === 0x05);
    done();
  });
  
  it('should be local ip', () => {
    assert(IpHelper.isLocalAddress('127.0.0.1'));
    assert(IpHelper.isLocalAddress('localhosT'));
    assert(IpHelper.isLocalAddress('192.168.0.1'));
    assert(IpHelper.isLocalAddress('10.0.1.0'));
    assert(IpHelper.isLocalAddress('::1'));
    assert(IpHelper.isLocalAddress('172.168.0.1') === false);
    assert(IpHelper.isLocalAddress('172.16.2.23'));
  });
});