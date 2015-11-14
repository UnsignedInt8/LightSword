'use strict'

import * as assert from 'assert'
import * as util from '../sources/socks5/util';

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
});