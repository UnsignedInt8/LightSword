'use strict'

const Socks5Server = require('../build/socks5/server');
const assert = require('assert');

describe('test server', () => {
  it('start server', () => {
    let s = new Socks5Server();
    assert(s.start());    
  })
})
